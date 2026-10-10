"""Export des images de la page d'accueil : étalonnage commun, recadrage,
AVIF + WebP en plusieurs largeurs.
Usage : python build_images.py <dossier_photos_brutes> <dossier_detourages> <dossier_plans_hero> <sortie>
"""
import json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from grade import grade

raw, cut, hero, out = sys.argv[1:5]
os.makedirs(out, exist_ok=True)
man = json.load(open(os.path.join(os.path.dirname(__file__), "images.json")))
report = {}

AVIF_Q, WEBP_Q = 52, 74


def export(im, name, widths, alpha=False, aq=AVIF_Q, wq=WEBP_Q):
    sizes = []
    for w in widths:
        w = min(w, im.width)
        r = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        for fmt, q in (("avif", aq), ("webp", wq)):
            p = os.path.join(out, f"{name}-{w}.{fmt}")
            kw = dict(quality=q)
            if fmt == "webp":
                kw.update(method=6, alpha_quality=80)
            else:
                kw.update(speed=4)
            r.save(p, fmt.upper(), **kw)
            sizes.append((os.path.basename(p), os.path.getsize(p) // 1024))
    report[name] = dict(w=im.width, h=im.height, ratio=round(im.width / im.height, 4), files=sizes)


for e in man["images"]:
    im = Image.open(os.path.join(raw, e["src"])).convert("RGB")
    W, H = im.size
    x0, y0, x1, y1 = e["crop"]
    im = im.crop((round(x0 * W), round(y0 * H), round(x1 * W), round(y1 * H)))
    export(grade(im), e["id"], e["widths"])

for e in man["cutouts"]:
    im = Image.open(os.path.join(cut, e["src"])).convert("RGBA")
    if "trim_left" in e:
        im = im.crop((round(e["trim_left"] * im.width), 0, im.width, im.height))
    if "trim_bottom" in e:
        im = im.crop((0, 0, im.width, round(e["trim_bottom"] * im.height)))
    a = im.getchannel("A")
    rgb = grade(im.convert("RGB"))
    rgb.putalpha(a)
    bbox = a.point(lambda v: 255 if v > 4 else 0).getbbox()
    export(rgb.crop(bbox), e["id"], e["widths"], alpha=True, aq=60, wq=80)

# Plans de la photo d'ouverture (déjà étalonnés par hero_layers.py).
for name, widths, aq in (("sky", [1280, 1920, 2560], 40), ("peaks", [1280, 1920, 2560], 52),
                         ("clouds", [1280, 1920, 2560], 50), ("fg", [1280, 1920, 2560], 54)):
    export(Image.open(os.path.join(hero, name + ".png")), "hero-" + name, widths, aq=aq)

# Version mobile : 2 plans seulement, recadrés en portrait autour du soleil et des mélèzes.
full = Image.open(os.path.join(hero, "full.png")).convert("RGB")
W, H = full.size
sky = Image.open(os.path.join(hero, "sky.png")).convert("RGBA")
bg = sky.copy()
for n in ("peaks", "clouds"):
    lay = Image.open(os.path.join(hero, n + ".png")).convert("RGBA")
    top = {"peaks": 0, "clouds": 0}
    # les plans ont été rognés verticalement : on les replace à leur position d'origine
    canvas = Image.new("RGBA", (W, H))
    box = json.load(open(os.path.join(hero, "boxes.json")))[n]
    canvas.paste(lay, (0, box[1]))
    bg = Image.alpha_composite(bg, canvas)
x0, x1 = round(0.06 * W), round(0.56 * W)
export(bg.convert("RGB").crop((x0, 0, x1, H)), "hero-m-bg", [720, 1080], aq=46)
fgl = Image.open(os.path.join(hero, "fg.png")).convert("RGBA")
box = json.load(open(os.path.join(hero, "boxes.json")))["fg"]
canvas = Image.new("RGBA", (W, H)); canvas.paste(fgl, (0, box[1]))
fgc = canvas.crop((x0, box[1], x1, H))
export(fgc, "hero-m-fg", [720, 1080], aq=54)

json.dump(report, open(os.path.join(out, "_report.json"), "w"), indent=1)
tot = sum(k for v in report.values() for f, k in v["files"])
print("total KB", tot)
for k, v in report.items():
    print(k, v["w"], v["h"], v["ratio"], [f"{f}:{s}" for f, s in v["files"]])

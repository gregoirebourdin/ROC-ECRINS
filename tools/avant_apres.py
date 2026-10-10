"""Planches avant / après de l'étalonnage commun.
Usage : python tools/avant_apres.py <photo_brute> <sortie.jpg> [largeur]"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, os.path.dirname(__file__))
from grade import grade

src, out = sys.argv[1:3]
w = int(sys.argv[3]) if len(sys.argv) > 3 else 900
a = Image.open(src).convert("RGB")
a = a.resize((w, round(a.height * w / a.width)), Image.LANCZOS)
b = grade(a)
pad, bar = 16, 44
c = Image.new("RGB", (w * 2 + pad * 3, a.height + pad * 2 + bar), "#F3F0EB")
c.paste(a, (pad, pad + bar)); c.paste(b, (w + pad * 2, pad + bar))
d = ImageDraw.Draw(c)
try:
    f = ImageFont.truetype("DejaVuSans.ttf", 22)
except OSError:
    f = ImageFont.load_default(size=22)
d.text((pad, pad + 6), "Avant (original du site)", fill="#5B2D1F", font=f)
d.text((w + pad * 2, pad + 6), "Après (étalonnage Roc Écrins)", fill="#C43B24", font=f)
c.save(out, quality=84)
print(out, c.size)

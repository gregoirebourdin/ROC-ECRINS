"""Découpe de la photo d'ouverture (mer de nuages, Clarée) en 4 plans pour la parallaxe :
ciel + soleil / sommets lointains / mer de nuages / mélèzes et neige au premier plan.

Usage : python hero_layers.py <photo> <profondeur.png> <lama.onnx> <dossier_sortie>
"""
import sys, os
import numpy as np
import cv2
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from grade import grade, smoothstep
from lama import inpaint

src, depth_p, lama_p, out = sys.argv[1:5]
os.makedirs(out, exist_ok=True)
img = np.asarray(grade(Image.open(src).convert("RGB"), warmth=1.1, sat_cap=0.55))
H, W = img.shape[:2]
D = np.asarray(Image.open(depth_p).convert("L").resize((W, H), Image.BICUBIC), np.float32) / 255
L = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255
yy = (np.arange(H, dtype=np.float32) / H)[:, None] * np.ones((1, W), np.float32)
xx = (np.arange(W, dtype=np.float32) / W)[None, :] * np.ones((H, 1), np.float32)

def refine(coarse, rgb, band, sigma=None):
    """Détourage par modèles de couleur locaux : dans une bande autour du bord grossier,
    l'alpha est la projection de chaque pixel entre la couleur moyenne locale du plan
    et celle du fond (silhouettes sombres sur nuages ou ciel clairs)."""
    sigma = sigma or band * 1.5
    c = rgb.astype(np.float32) / 255
    m = (coarse > 0.5).astype(np.uint8)
    k = np.ones((band, band), np.uint8)
    f_core = cv2.erode(m, k).astype(np.float32)
    b_core = cv2.erode(1 - m, k).astype(np.float32)
    zone = (cv2.dilate(m, k) - cv2.erode(m, k)).astype(bool)
    def local_mean(w):
        num = cv2.GaussianBlur(c * w[..., None], (0, 0), sigma)
        den = cv2.GaussianBlur(w, (0, 0), sigma)[..., None]
        return num / np.maximum(den, 1e-4), den[..., 0]
    mf, df = local_mean(f_core)
    mb, db = local_mean(b_core)
    v = mf - mb
    n2 = (v * v).sum(-1)
    a = ((c - mb) * v).sum(-1) / np.maximum(n2, 1e-4)
    ok = zone & (n2 > 0.004) & (df > 0.01) & (db > 0.01)
    out = coarse.astype(np.float32).copy()
    out[ok] = np.clip(a[ok], 0, 1)
    return cv2.GaussianBlur(out, (0, 0), 0.7)


def poly_mask(pts):
    m = np.zeros((H, W), np.uint8)
    cv2.fillPoly(m, [np.array([(x / 100 * W, y / 100 * H) for x, y in pts], np.int32)], 1)
    return m.astype(np.float32)


# --- Premier plan : la pente enneigée (tracée à la main) + les mélèzes (détourés) ---
ground = poly_mask([(0, 57.5), (4, 61.5), (8, 64.5), (12, 66.5), (16, 68.5), (20, 72), (24, 76.5),
                    (28, 80.5), (31, 84.5), (35, 86.8), (40, 87.6), (45, 88.2), (50, 88.3), (55, 87.8),
                    (60, 87.2), (65, 86.6), (70, 86.2), (75, 85.6), (80, 84.8), (85, 84.2), (90, 83.2),
                    (95, 81.8), (100, 80.3), (100, 100), (0, 100)])
# Profondeur attendue des nuages selon la hauteur (régression sur la zone de nuages pure).
rows = np.arange(int(0.36 * H), int(0.62 * H))
med = np.median(D[rows, int(0.32 * W):int(0.62 * W)], axis=1)
a1, a0 = np.polyfit(rows / H, med, 1)
cloud_d = a0 + a1 * yy
near = smoothstep(0.05, 0.10, D - cloud_d) * (yy > 0.40)
near = cv2.dilate((near > 0.3).astype(np.uint8), np.ones((15, 15), np.uint8)).astype(np.float32)
dark = 1 - smoothstep(0.17, 0.30, L)
trees = (dark * near > 0.5).astype(np.float32)
coarse_fg = np.maximum(ground, trees)
coarse_fg = cv2.morphologyEx(coarse_fg, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
fg = refine(coarse_fg, img, band=9)
fg = np.maximum(fg, cv2.erode(ground, np.ones((9, 9), np.uint8)))
fg[: int(0.36 * H)] = 0

# --- Sommets lointains --------------------------------------------------------------
top = (yy < 0.30).astype(np.float32)
# Luminance du ciel, ligne par ligne, interpolée depuis les pixels de ciel pur (profondeur nulle).
sky_est = np.zeros_like(L)
for y in range(int(0.10 * H), int(0.30 * H)):
    xs_ = np.where(D[y] < 0.006)[0]
    sky_est[y] = np.interp(np.arange(W), xs_, L[y, xs_]) if len(xs_) > 20 else 1.0
coarse_pk = ((L < sky_est - 0.035) & (yy > 0.12) & (yy < 0.30)).astype(np.float32)
coarse_pk = np.maximum(coarse_pk, ((D > 0.03) & (yy < 0.30) & (L < 0.8)).astype(np.float32))
# Sous le soleil, la crête est noyée dans l'éblouissement : on la limite à sa ligne réelle.
coarse_pk[(xx > 0.04) & (xx < 0.19) & (yy < 0.225)] = 0
coarse_pk = cv2.morphologyEx(coarse_pk, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
coarse_pk = cv2.morphologyEx(coarse_pk, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
peaks = refine(coarse_pk, img, band=11) * top
peaks[(L > 0.86) & (yy < 0.26)] = 0  # jamais le disque du soleil dans le plan des sommets
# Bande basse opaque (brume sous les sommets), recouverte par la mer de nuages.
peaks = np.maximum(peaks, smoothstep(0.255, 0.28, yy) * (yy < 0.42))

# --- Mer de nuages ------------------------------------------------------------------
clouds = smoothstep(0.285, 0.325, yy)
hill = refine(((D > 0.09) & (yy < 0.42) & (xx > 0.8)).astype(np.float32), img, band=9)
clouds = np.maximum(clouds, hill)

def save(name, rgb, a=None, crop=True):
    if a is None:
        Image.fromarray(rgb).save(os.path.join(out, name + ".png"))
        return (0, 0, W, H)
    a8 = (np.clip(a, 0, 1) * 255).astype(np.uint8)
    ys, xs = np.where(a8 > 2)
    box = (0, int(ys.min()), W, int(ys.max()) + 1) if crop else (0, 0, W, H)
    rgba = np.dstack([rgb, a8])[box[1]:box[3], box[0]:box[2]]
    Image.fromarray(rgba, "RGBA").save(os.path.join(out, name + ".png"))
    return box

# Ciel : on efface les sommets (LaMa) pour qu'il reste du ciel derrière eux.
m_sky = (cv2.dilate((peaks > 0.1).astype(np.uint8), np.ones((25, 25), np.uint8)) * (yy < 0.3)).astype(np.uint8) * 255
sky = inpaint(img, m_sky, lama_p, work_w=1536)
# Nuages : on prolonge la mer de nuages derrière les mélèzes et la neige.
m_cl = cv2.dilate((fg > 0.1).astype(np.uint8), np.ones((41, 41), np.uint8))
# Les brindilles et arbres nus, fins et sombres, restés dans la mer de nuages sous le premier plan.
brindilles = ((L < 0.3) & (yy > 0.5)).astype(np.uint8)
m_cl = np.maximum(m_cl, cv2.dilate(brindilles, np.ones((25, 25), np.uint8))).astype(np.uint8) * 255
cl_rgb = inpaint(img, m_cl, lama_p, work_w=1536)

boxes = {
    "sky": save("sky", sky),
    "peaks": save("peaks", img, peaks),
    "clouds": save("clouds", cl_rgb, clouds),
    "fg": save("fg", img, fg),
}
Image.fromarray(img).save(os.path.join(out, "full.png"))
import json
json.dump({k: [int(v) for v in b] for k, b in boxes.items()}, open(os.path.join(out, "boxes.json"), "w"))
print({k: [round(v / (W if i % 2 == 0 else H) * 100, 3) for i, v in enumerate(b)] for k, b in boxes.items()})
# Planche de contrôle
prev = []
for k in ["peaks", "clouds", "fg"]:
    a = np.asarray(Image.open(os.path.join(out, k + ".png")))
    can = np.full((H, W, 3), (255, 0, 255), np.uint8)
    b = boxes[k]
    al = a[..., 3:4] / 255.0
    can[b[1]:b[3]] = (a[..., :3] * al + can[b[1]:b[3]] * (1 - al)).astype(np.uint8)
    prev.append(cv2.resize(can, (W // 4, H // 4)))
prev.append(cv2.resize(sky, (W // 4, H // 4)))
grid = np.vstack([np.hstack(prev[:2]), np.hstack(prev[2:])])
Image.fromarray(grid).save(os.path.join(out, "_check.jpg"), quality=85)

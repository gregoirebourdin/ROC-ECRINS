"""Étalonnage commun Roc Écrins.

Une même chaleur pour toute la page, accordée au brun terre (#5B2D1F) et au
rouge brique (#C43B24) :
  - ombres légèrement relevées et teintées brun (jamais de noir pur) ;
  - blancs de neige nettoyés (dominante bleue retirée dans les hautes lumières) ;
  - demi-teintes un peu réchauffées ;
  - saturation des couchers de soleil plafonnée en douceur.
"""
import numpy as np
from PIL import Image


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def grade(im: Image.Image, warmth=1.25, lift=1.15, sat_cap=0.58, sat=0.96, clean=1.0, contrast=0.10) -> Image.Image:
    x = np.asarray(im.convert("RGB"), dtype=np.float32) / 255.0
    L = (0.2126 * x[..., 0] + 0.7152 * x[..., 1] + 0.0722 * x[..., 2])[..., None]

    # 1. Blancs propres : on neutralise les hautes lumières peu saturées.
    mx, mn = x.max(-1, keepdims=True), x.min(-1, keepdims=True)
    s = (mx - mn) / (mx + 1e-6)
    t = smoothstep(0.62, 0.95, L) * (1 - smoothstep(0.08, 0.3, s)) * 0.55 * clean
    x = x * (1 - t) + L * t

    # 2. Chaleur dans les demi-teintes (les blancs et les noirs ne bougent pas).
    mid = 4 * L * (1 - L)
    wb = np.array([1 + 0.03 * warmth, 1 + 0.004 * warmth, 1 - 0.045 * warmth], dtype=np.float32)
    x = x * (1 + (wb - 1) * mid)

    # 3. Saturation : légère baisse globale + plafond doux sur les couleurs criardes.
    L2 = (0.2126 * x[..., 0] + 0.7152 * x[..., 1] + 0.0722 * x[..., 2])[..., None]
    mx, mn = x.max(-1, keepdims=True), x.min(-1, keepdims=True)
    s = (mx - mn) / (mx + 1e-6)
    s_new = np.where(s > sat_cap, sat_cap + (s - sat_cap) * 0.45, s) * sat
    k = np.where(s > 1e-4, s_new / (s + 1e-6), 1.0)
    x = L2 + (x - L2) * k

    # 4. Ombres relevées et teintées brun terre.
    tint = np.array([0.050, 0.030, 0.024], dtype=np.float32) * lift
    x = tint + x * (1 - tint)

    # 5. Courbe en S très douce : un peu de corps dans les demi-teintes.
    x = np.clip(x, 0, 1)
    x = x + contrast * (x - 0.5) * x * (1 - x) * 4
    return Image.fromarray((np.clip(x, 0, 1) * 255 + 0.5).astype(np.uint8))


if __name__ == "__main__":
    import sys
    src, out = sys.argv[1:3]
    grade(Image.open(src)).save(out, quality=92)

"""Détourage des invités surprises (BiRefNet, ONNX, licence MIT) : bords doux, poils préservés.
Usage : python cutout.py <birefnet.onnx> <photo> <sortie.png> [x0 y0 x1 y1 en %]
"""
import sys
import numpy as np
import onnxruntime as ort
import cv2
from PIL import Image

model, src, out = sys.argv[1:4]
im = Image.open(src).convert("RGB")
if len(sys.argv) > 4:
    x0, y0, x1, y1 = [float(v) / 100 for v in sys.argv[4:8]]
    W, H = im.size
    im = im.crop((int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)))
W, H = im.size
x = np.asarray(im.resize((1024, 1024), Image.BICUBIC), np.float32) / 255
x = ((x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]).transpose(2, 0, 1)[None].astype(np.float32)
sess = ort.InferenceSession(model, providers=["CPUExecutionProvider"])
pred = sess.run(None, {sess.get_inputs()[0].name: x})[-1][0, 0]
pred = 1 / (1 + np.exp(-pred)) if pred.min() < 0 or pred.max() > 1 else pred
a = cv2.resize(pred.astype(np.float32), (W, H), interpolation=cv2.INTER_CUBIC)
a = np.clip((a - 0.04) / 0.92, 0, 1)
rgb = np.asarray(im, np.float32) / 255
# Décontamination des bords : on pousse la couleur des pixels semi-transparents vers
# la couleur intérieure voisine, pour éviter le liseré de neige ou de ciel.
inner = (a > 0.95).astype(np.float32)
num = cv2.GaussianBlur(rgb * inner[..., None], (0, 0), 6)
den = cv2.GaussianBlur(inner, (0, 0), 6)[..., None]
fgc = np.where(den > 1e-3, num / np.maximum(den, 1e-3), rgb)
edge = ((a > 0.02) & (a < 0.95))[..., None]
rgb = np.where(edge, rgb * 0.35 + fgc * 0.65, rgb)
rgba = np.dstack([np.clip(rgb, 0, 1) * 255, a * 255]).astype(np.uint8)
ys, xs = np.where(a > 0.02)
pad = 8
box = (max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + pad, W), min(ys.max() + pad, H))
Image.fromarray(rgba, "RGBA").crop(box).save(out)
print("ok", box, (W, H))

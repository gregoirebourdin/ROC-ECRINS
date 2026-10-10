"""Carte de profondeur (Depth Anything V2 Small, ONNX, Apache-2.0).
Usage : python depth.py <modele.onnx> <image> <sortie.png>
"""
import sys
import numpy as np
import onnxruntime as ort
from PIL import Image

model, src, out = sys.argv[1:4]
im = Image.open(src).convert("RGB")
W, H = im.size
# Le modèle attend des côtés multiples de 14 ; on garde le ratio, ~770 px de large.
tw = int(sys.argv[4]) if len(sys.argv) > 4 else 770
th = int(round(H * tw / W / 14) * 14)
tw = int(round(tw / 14) * 14)
x = np.asarray(im.resize((tw, th), Image.BICUBIC), dtype=np.float32) / 255.0
x = (x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
x = x.transpose(2, 0, 1)[None].astype(np.float32)
sess = ort.InferenceSession(model, providers=["CPUExecutionProvider"])
d = sess.run(None, {sess.get_inputs()[0].name: x})[0][0]
d = (d - d.min()) / (d.max() - d.min() + 1e-6)  # 1 = proche
Image.fromarray((d * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC).save(out)
print("ok", d.shape)

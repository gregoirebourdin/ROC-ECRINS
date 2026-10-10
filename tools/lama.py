"""Remplissage (LaMa, ONNX, Apache-2.0) par tuiles 512 px, pour combler l'arrière-plan
caché derrière un plan découpé. Jamais utilisé pour créer un paysage : uniquement
pour prolonger quelques centaines de pixels de nuages ou de ciel derrière un plan."""
import numpy as np
import onnxruntime as ort
import cv2

_sess = None


def _session(model):
    global _sess
    if _sess is None:
        _sess = ort.InferenceSession(model, providers=["CPUExecutionProvider"])
    return _sess


def inpaint(img, mask, model, work_w=1536, tile=512, stride=384):
    """img: uint8 HxWx3 RGB ; mask: uint8 HxW (255 = à combler)."""
    H, W = mask.shape
    s = work_w / W
    wh, ww = int(round(H * s)), work_w
    im = cv2.resize(img, (ww, wh), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
    mk = (cv2.resize(mask, (ww, wh), interpolation=cv2.INTER_NEAREST) > 127).astype(np.float32)
    acc = np.zeros_like(im)
    wsum = np.zeros((wh, ww, 1), np.float32)
    sess = _session(model)
    ys = list(range(0, max(wh - tile, 0) + 1, stride)) or [0]
    xs = list(range(0, max(ww - tile, 0) + 1, stride)) or [0]
    if ys[-1] + tile < wh:
        ys.append(wh - tile)
    if xs[-1] + tile < ww:
        xs.append(ww - tile)
    ramp = np.minimum(np.linspace(0, 1, tile) * 6, 1)
    win = np.minimum(ramp, ramp[::-1])
    win = np.clip(np.outer(win, win), 0.02, 1)[..., None].astype(np.float32)
    for y in ys:
        for x in xs:
            m = mk[y:y + tile, x:x + tile]
            if m.sum() < 1:
                continue
            t = im[y:y + tile, x:x + tile]
            inp = {sess.get_inputs()[0].name: t.transpose(2, 0, 1)[None],
                   sess.get_inputs()[1].name: m[None, None]}
            out = sess.run(None, inp)[0][0].transpose(1, 2, 0)
            if out.max() > 2:
                out = out / 255.0
            acc[y:y + tile, x:x + tile] += out * win
            wsum[y:y + tile, x:x + tile] += win
    filled = np.where(wsum > 0, acc / np.maximum(wsum, 1e-6), im)
    filled = cv2.resize(filled, (W, H), interpolation=cv2.INTER_CUBIC)
    # On redonne du grain photo à la zone comblée, pour qu'elle ne paraisse pas lisse.
    rng = np.random.default_rng(7)
    grain = rng.normal(0, 0.012, filled.shape).astype(np.float32)
    filled = np.clip(filled + grain, 0, 1)
    m = cv2.GaussianBlur((mask > 127).astype(np.float32), (0, 0), 3)[..., None]
    base = img.astype(np.float32) / 255
    return (np.clip(base * (1 - m) + filled * m, 0, 1) * 255 + 0.5).astype(np.uint8)

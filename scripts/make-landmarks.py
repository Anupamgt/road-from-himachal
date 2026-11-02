"""Turns the landmark photos in art-src/ into palette-locked pixel art in public/landmarks/.

Each photo is cropped, the sky (and stray greenery) is cut out where the landmark should stand
on its own, then it is shrunk and mapped to the 16-colour palette with an ordered (Bayer) dither,
so it sits in the scenes like the rest of the art. Run: python scripts/make-landmarks.py
"""
import os

import numpy as np
from PIL import Image

PALETTE = [
    '#142a1d', '#1f3d2b', '#3e6b48', '#7fa66a', '#dde5df', '#f7f5f0', '#2b2f33', '#6b7177',
    '#f2c230', '#e8743b', '#b9472a', '#1b2440', '#6e9fc9', '#7a4a2b', '#c98e6a', '#15171a',
]
PAL = np.array([[int(h[i:i + 2], 16) for i in (1, 3, 5)] for h in PALETTE], dtype=np.float32)
BAYER = (np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], dtype=np.float32) + 0.5) / 16 - 0.5

os.makedirs('public/landmarks', exist_ok=True)


def quantize(rgb: np.ndarray, spread: float, colours: np.ndarray = PAL) -> np.ndarray:
    h, w, _ = rgb.shape
    tile = np.tile(BAYER, (h // 4 + 1, w // 4 + 1))[:h, :w, None]
    shifted = np.clip(rgb + tile * spread, 0, 255)
    d = ((shifted[:, :, None, :] - colours[None, None, :, :]) ** 2).sum(axis=3)
    return colours[d.argmin(axis=2)].astype(np.uint8)


def build(src: str, out: str, box, size, cut_sky: bool, spread: float = 22, only=None, gain: float = 1.0) -> None:
    im = Image.open(src).convert('RGB').crop(box)
    arr = np.asarray(im).astype(np.int32)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    alpha = np.full(r.shape, 255, dtype=np.uint8)
    if cut_sky:
        sky = (b - r > 20) & (b > 150) & (r < 205)
        green = (g > r + 14) & (g > b + 14)
        alpha[sky | green] = 0
    # shrink with a box filter on colour (premultiplied by alpha) and on alpha
    small = im.resize(size, Image.BOX)
    a_small = Image.fromarray(alpha).resize(size, Image.BOX)
    rgb = np.asarray(small).astype(np.float32)
    a = np.asarray(a_small)
    # colour of the kept pixels only, so cut-out edges do not pull in sky blue
    masked = Image.fromarray((arr * (alpha[..., None] > 0)).astype(np.uint8)).resize(size, Image.BOX)
    weight = Image.fromarray((alpha > 0).astype(np.uint8) * 255).resize(size, Image.BOX)
    w = np.maximum(np.asarray(weight).astype(np.float32) / 255, 1e-3)[..., None]
    rgb = np.where(w > 0.01, np.asarray(masked).astype(np.float32) / w, rgb) if cut_sky else rgb
    colours = PAL if only is None else PAL[[PALETTE.index(c) for c in only]]
    out_rgb = quantize(np.clip(rgb * gain, 0, 255), spread, colours)
    rgba = np.dstack([out_rgb, np.where(a > 140, 255, 0).astype(np.uint8)])
    Image.fromarray(rgba, 'RGBA').save(out)
    print(out, size)


# Two sizes of each: "l" for laptop-sized windows, "s" for short ones (phones).
NEUTRALS = ['#f7f5f0', '#dde5df', '#6b7177', '#2b2f33', '#c98e6a']
for tag, ropar, patna in (('l', (56, 77), (116, 74)), ('s', (42, 58), (88, 56))):
    # IIT Ropar: the sculpted tower with its cube frame; the sky is cut out.
    build('art-src/iit_ropar.jpg', f'public/landmarks/iit_ropar_{tag}.png', (348, 285, 676, 735), ropar, True, 18, NEUTRALS, 1.55)
    # IIT Patna: the gate with its sign, as a whole picture.
    build('art-src/iit_patna.jpg', f'public/landmarks/iit_patna_{tag}.png', (0, 46, 448, 332), patna, False, 18)

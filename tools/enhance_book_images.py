#!/usr/bin/env python3
"""Cleans and enlarges the book illustrations for display. The embedded images in the book PDF are small
(about 75-97 ppi), so true detail cannot be recovered; this removes JPEG noise, enlarges with Lanczos and
sharpens lines slightly. Usage: python3 tools/enhance_book_images.py <folder with im-000.jpg ...>"""
import sys, pathlib, json, numpy as np, cv2
from PIL import Image, ImageFilter
root = pathlib.Path(__file__).resolve().parent.parent
src = pathlib.Path(sys.argv[1])
for p, k in json.loads((root/'content/book-image-map.json').read_text()):
    a = np.array(Image.open(src/f'im-{k-1:03d}.jpg').convert('RGB'))
    a = cv2.fastNlMeansDenoisingColored(a, None, 4, 4, 5, 15)
    f = min(3.0, max(1.0, 900/a.shape[1]))
    a = cv2.resize(a, None, fx=f, fy=f, interpolation=cv2.INTER_LANCZOS4)
    Image.fromarray(a).filter(ImageFilter.UnsharpMask(1.6, 110, 3)).save(root/f'img/book/b{k:03d}.jpg', quality=85, optimize=True, progressive=True)
    im = Image.open(root/f'img/book/b{k:03d}.jpg'); (root/'img/book/t').mkdir(exist_ok=True)
    im.resize((min(520, im.width), int(im.height*min(520, im.width)/im.width)), Image.LANCZOS).save(root/f'img/book/t/b{k:03d}.jpg', quality=82, optimize=True, progressive=True)

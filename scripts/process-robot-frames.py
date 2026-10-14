"""Quita chroma verde de frames nuevos y exporta PNG/WebP."""
from PIL import Image
from pathlib import Path

src_dir = Path(
    r"C:\Users\USUARIO\.cursor\projects\c-Users-USUARIO-Desktop-proyecto-semillero\assets"
)
frames = Path(r"c:\Users\USUARIO\Desktop\proyecto semillero\frames")
out_webp = Path(r"c:\Users\USUARIO\Desktop\proyecto semillero\src\assets\robot")
frames.mkdir(exist_ok=True)
out_webp.mkdir(parents=True, exist_ok=True)

files = {
    "robot_walk_l.jpg": "robot_walk_l",
    "robot_walk_r.jpg": "robot_walk_r",
    "robot_jump_up.jpg": "robot_jump_up",
    "robot_jump_apex.jpg": "robot_jump_apex",
    "robot_jump_down.jpg": "robot_jump_down",
}


def knock_chroma_green(im: Image.Image, thr=90):
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            greenness = g - max(r, b)
            if g >= 135 and greenness >= thr:
                px[x, y] = (r, g, b, 0)
            elif g >= 105 and greenness >= thr - 35:
                alpha = int(255 * (1 - (greenness - (thr - 35)) / 35))
                px[x, y] = (r, g, b, max(0, min(255, alpha)))
    return im


for src_name, stem in files.items():
    src = src_dir / src_name
    if not src.exists():
        print("MISSING", src)
        continue
    out = knock_chroma_green(Image.open(src))
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    side = max(out.size) + 48
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(out, ((side - out.size[0]) // 2, (side - out.size[1]) // 2), out)
    canvas.save(frames / f"{stem}.png", "PNG")
    canvas.save(out_webp / f"{stem}.webp", "WEBP", quality=90, method=6)
    print(stem, "->", canvas.size)

print("done")

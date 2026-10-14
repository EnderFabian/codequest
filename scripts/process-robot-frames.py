"""Quita chroma verde (#00FF00) o negro de los frames y exporta PNG/WebP."""
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
    "robot_walk_a.jpg": "robot_walk_a",
    "robot_walk_b.jpg": "robot_walk_b",
    "robot_fall.jpg": "robot_fall",
}


def knock_chroma_green(im: Image.Image, thr=95):
    """Transparencia por distancia al verde puro; preserva negro del visor."""
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            # Verde dominante: G alto y R/B bajos
            greenness = g - max(r, b)
            if g >= 140 and greenness >= thr:
                px[x, y] = (r, g, b, 0)
            elif g >= 110 and greenness >= thr - 35:
                alpha = int(255 * (1 - (greenness - (thr - 35)) / 35))
                px[x, y] = (r, g, b, max(0, min(255, alpha)))
    return im


def knock_near_white(im: Image.Image, thr=245):
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if min(r, g, b) >= thr and max(r, g, b) - min(r, g, b) < 12:
                px[x, y] = (r, g, b, 0)
    return im


def sample_corner_bg(im: Image.Image):
    im = im.convert("RGBA")
    w, h = im.size
    samples = [im.getpixel((2, 2)), im.getpixel((w - 3, 2)), im.getpixel((2, h - 3))]
    avg = tuple(sum(c[i] for c in samples) // len(samples) for i in range(3))
    return avg


for src_name, stem in files.items():
    src = src_dir / src_name
    im = Image.open(src)
    bg = sample_corner_bg(im)
    # Preferir chroma verde; si el fondo es oscuro, usar knock negro suave solo en bordes
    if bg[1] > bg[0] + 40 and bg[1] > bg[2] + 40:
        out = knock_chroma_green(im)
    elif sum(bg) / 3 > 220:
        out = knock_near_white(im)
    else:
        # Fondo oscuro: flood-fill aproximado por umbral de luminancia solo si es muy oscuro
        out = im.convert("RGBA")
        px = out.load()
        w, h = out.size
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if max(r, g, b) < 28 and abs(r - g) < 8 and abs(g - b) < 8:
                    px[x, y] = (r, g, b, 0)

    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    side = max(out.size) + 48
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(out, ((side - out.size[0]) // 2, (side - out.size[1]) // 2), out)
    png_path = frames / f"{stem}.png"
    webp_path = out_webp / f"{stem}.webp"
    canvas.save(png_path, "PNG")
    canvas.save(webp_path, "WEBP", quality=90, method=6)
    print(stem, "bg=", bg, "->", canvas.size)

print("done")

"""
Fast (no-AI) processor for the Feather Sort PNGs.

Uses luminance + saturation thresholding to drop the dark gray backgrounds
behind the generated feathers and nests, then alpha-bbox trims. Much faster
than rembg/U2Net (seconds, not minutes), and good enough for these images
where subject is bright + saturated and background is dark + gray.

Run: python scripts/process_sort_assets_fast.py
"""

from pathlib import Path
from PIL import Image, ImageFilter
import colorsys
import sys

SORT_DIR = Path("public/media/sort").resolve()

GRID_TYPES = [
    "falcon",     # (0, 0)
    "courage",    # (1, 0)
    "wind",       # (2, 0)
    "confidence", # (0, 1)
    "wisdom",     # (1, 1)
    "joy",        # (2, 1)
]


def hls_threshold_alpha(
    img: Image.Image,
    keep_min_l: float = 0.18,
    keep_min_s: float = 0.18,
    feather_radius: int = 3,
) -> Image.Image:
    """
    Replace the alpha channel based on HLS thresholds.

    A pixel is KEPT (alpha=255) when EITHER:
      * its lightness >= keep_min_l (bright pixels — the glow), OR
      * its saturation >= keep_min_s (colored pixels — the subject)
    Everything else (dark + gray = background) is set transparent.
    The alpha mask is then Gaussian-blurred so edges feather smoothly.
    """
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    mask = Image.new("L", (w, h), 0)
    mpx = mask.load()
    for y in range(h):
        for x in range(w):
            r, g, b, _a = px[x, y]
            hh, ll, ss = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
            if ll >= keep_min_l or ss >= keep_min_s:
                # Map lightness in [keep_min_l, 1] → [200, 255] so soft edges
                # carry partial alpha.
                alpha = 255
                if ll < 0.35 and ss < 0.35:
                    # near-threshold: weaken alpha to soften halo
                    alpha = max(180, int(255 * (ll + ss) / 0.7))
                mpx[x, y] = alpha
            else:
                mpx[x, y] = 0
    # Gaussian-feather the mask so the rip-line isn't sharp.
    mask = mask.filter(ImageFilter.GaussianBlur(radius=feather_radius))
    img.putalpha(mask)
    return img


def chroma_key_alpha(
    img: Image.Image,
    tolerance: int = 75,
    soft: int = 40,
    feather_radius: int = 2,
) -> Image.Image:
    """
    Background removal by sampling the corner color.

    Samples a small patch in each corner and uses the median color as the
    "background." Each pixel's distance from that color is mapped to alpha:
      distance <= tolerance       → fully transparent (background)
      distance > tolerance + soft → fully opaque (subject)
      between                     → ramp
    Works well when the background is a relatively uniform tint, like the
    dark gray-striped backdrop behind the feather/nest cells.
    """
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size

    # Sample 12×12 patches at each corner and at top-center/bottom-center.
    samples = []
    patch = 12
    for cx, cy in [
        (0, 0), (w - patch, 0), (0, h - patch), (w - patch, h - patch),
        ((w - patch) // 2, 0), ((w - patch) // 2, h - patch),
    ]:
        rs, gs, bs = [], [], []
        for x in range(cx, cx + patch):
            for y in range(cy, cy + patch):
                r, g, b, _ = px[x, y]
                rs.append(r); gs.append(g); bs.append(b)
        rs.sort(); gs.sort(); bs.sort()
        mid = len(rs) // 2
        samples.append((rs[mid], gs[mid], bs[mid]))
    # Median of the patch medians = robust background estimate.
    samples.sort(key=lambda s: s[0] + s[1] + s[2])
    bg_r, bg_g, bg_b = samples[len(samples) // 2]

    mask = Image.new("L", (w, h), 255)
    mpx = mask.load()
    t2 = tolerance * tolerance
    s2 = (tolerance + soft) ** 2
    for y in range(h):
        for x in range(w):
            r, g, b, _ = px[x, y]
            dr = r - bg_r; dg = g - bg_g; db = b - bg_b
            d2 = dr * dr + dg * dg + db * db
            if d2 <= t2:
                mpx[x, y] = 0
            elif d2 >= s2:
                mpx[x, y] = 255
            else:
                # Ramp 0→255 across [t2, s2)
                t = (d2 - t2) / (s2 - t2)
                mpx[x, y] = int(255 * t)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=feather_radius))
    img.putalpha(mask)
    return img


def trim_alpha(img: Image.Image, pad: int = 12) -> Image.Image:
    """Crop to the alpha bounding box with a padding."""
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    alpha = img.split()[3]
    bbox = alpha.getbbox()
    if not bbox:
        return img
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(img.width, r + pad)
    b = min(img.height, b + pad)
    return img.crop((l, t, r, b))


def crop_grid(src_path: Path, prefix: str, cols: int = 3, rows: int = 2,
              tolerance: int = 70, soft: int = 50) -> None:
    print(f"\n>> {src_path.name} (chroma-key, tol={tolerance})")
    img = Image.open(src_path).convert("RGBA")
    cell_w = img.width // cols
    cell_h = img.height // rows
    for i, t in enumerate(GRID_TYPES):
        c = i % cols
        r = i // cols
        box = (c * cell_w, r * cell_h, (c + 1) * cell_w, (r + 1) * cell_h)
        cell = img.crop(box)
        masked = chroma_key_alpha(cell, tolerance=tolerance, soft=soft)
        trimmed = trim_alpha(masked, pad=14)
        out = SORT_DIR / f"{prefix}-{t}.png"
        trimmed.save(out, "PNG", optimize=True)
        print(f"   ok {out.name} {trimmed.width}x{trimmed.height}")


def process_single(name: str, out_name: str | None = None,
                   tolerance: int = 75, soft: int = 45,
                   trim: bool = True, pad: int = 8) -> None:
    src = SORT_DIR / name
    if not src.exists():
        print(f"   (skip {name} - not found)")
        return
    print(f"\n>> {name} (chroma-key, tol={tolerance})")
    img = Image.open(src).convert("RGBA")
    masked = chroma_key_alpha(img, tolerance=tolerance, soft=soft)
    if trim:
        masked = trim_alpha(masked, pad=pad)
    dst = SORT_DIR / (out_name or name)
    masked.save(dst, "PNG", optimize=True)
    print(f"   ok {dst.name} {masked.width}x{masked.height}")


def process_bird_sheet(name: str = "bird-fly-frames.png",
                       cols: int = 4, rows: int = 2) -> None:
    """The sheet stays grid-aligned (we don't trim), but bg gets stripped."""
    src = SORT_DIR / name
    if not src.exists():
        print(f"   (skip {name} - not found)")
        return
    print(f"\n>> {name} (sprite sheet - preserves grid alignment)")
    img = Image.open(src).convert("RGBA")
    # Bird sheet bg is the white-with-checkerboard pattern from the AI tool.
    masked = chroma_key_alpha(img, tolerance=80, soft=50, feather_radius=2)
    masked.save(src, "PNG", optimize=True)
    print(f"   ok {src.name} {masked.width}x{masked.height} (sheet)")

    # Also dump individual frames for code that wants them.
    cell_w = masked.width // cols
    cell_h = masked.height // rows
    frame_dir = SORT_DIR / "bird-frames"
    frame_dir.mkdir(exist_ok=True)
    for i in range(cols * rows):
        c = i % cols
        r = i // cols
        frame = masked.crop((c * cell_w, r * cell_h, (c + 1) * cell_w, (r + 1) * cell_h))
        trimmed = trim_alpha(frame, pad=8)
        trimmed.save(frame_dir / f"frame-{i + 1}.png", "PNG", optimize=True)
    print(f"   ok {cols * rows} frames -> public/media/sort/bird-frames/")


def main() -> None:
    if not SORT_DIR.exists():
        print(f"!! {SORT_DIR} doesn't exist", file=sys.stderr)
        sys.exit(1)

    feather_grid = SORT_DIR / "feather-{type}.png"
    if feather_grid.exists():
        crop_grid(feather_grid, "feather", tolerance=70, soft=55)
        feather_grid.unlink()
        print("   removed source feather-{type}.png")
    else:
        # Per-feather files already exist from a prior run with bad
        # thresholds; re-process them in place to clean backgrounds.
        for t in GRID_TYPES:
            process_single(f"feather-{t}.png", tolerance=70, soft=55, pad=14)

    nest_grid = SORT_DIR / "nest-{type}.png"
    if nest_grid.exists():
        crop_grid(nest_grid, "nest", tolerance=70, soft=55)
        nest_grid.unlink()
        print("   removed source nest-{type}.png")
    else:
        for t in GRID_TYPES:
            process_single(f"nest-{t}.png", tolerance=70, soft=55, pad=14)

    # Bird hero - purple/magenta bird against grey background.
    process_single("bird-fly.png", tolerance=80, soft=45, pad=10)
    # Spiders - light background.
    process_single("spider-creep.png", tolerance=70, soft=40, pad=8)
    process_single("spider-eating.png", tolerance=70, soft=40, pad=8)

    # Bird sprite-sheet: keep grid alignment, just strip bg.
    process_bird_sheet("bird-fly-frames.png")

    print("\nDone.")


if __name__ == "__main__":
    main()

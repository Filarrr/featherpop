"""
One-shot processor for the Feather Sort PNGs the client generated:
  1. Crops the 3×2 feather-{type}.png grid into 6 named files
  2. Crops the 3×2 nest-{type}.png grid into 6 named files
  3. Strips backgrounds from bird-fly, bird-fly-frames, feather/nest cells,
     and the spider images using `rembg` (runs an ONNX U2Net model locally).
  4. Trims excess transparent margin so the kept subject is tightly framed.

Run: python scripts/process_sort_assets.py
"""

from pathlib import Path
from PIL import Image
from rembg import remove, new_session
import io
import sys

SORT_DIR = Path("public/media/sort").resolve()

# Cell index → type, reading top-left → bottom-right.
# Top row (orange / pink / cyan-white), bottom row (purple / mint / gold).
GRID_TYPES = [
    "falcon",      # (0, 0) orange
    "courage",     # (1, 0) pink
    "wind",        # (2, 0) cyan-white
    "confidence",  # (0, 1) purple
    "wisdom",      # (1, 1) mint
    "joy",         # (2, 1) gold
]

# u2net is the standard general-purpose model. For people/avatars u2netp is
# smaller/faster. For these illustrated objects u2net works well.
SESSION = new_session("u2net")


def strip_bg(img: Image.Image) -> Image.Image:
    """Strip background and return RGBA."""
    out = remove(img, session=SESSION, alpha_matting=False, post_process_mask=True)
    if isinstance(out, bytes):
        out = Image.open(io.BytesIO(out))
    return out.convert("RGBA")


def trim_alpha(img: Image.Image, pad: int = 8) -> Image.Image:
    """Crop the image to its alpha bounding box with a small padding."""
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


def crop_grid(src_path: Path, prefix: str, cols: int = 3, rows: int = 2) -> None:
    """Crop a grid PNG into named cells, strip bg, write each to disk."""
    print(f"\n>> Cropping {src_path.name} → {cols * rows} cells")
    img = Image.open(src_path).convert("RGBA")
    cell_w = img.width // cols
    cell_h = img.height // rows
    for i, feather_type in enumerate(GRID_TYPES):
        c = i % cols
        r = i // cols
        box = (c * cell_w, r * cell_h, (c + 1) * cell_w, (r + 1) * cell_h)
        cell = img.crop(box)
        print(f"   bg-strip + trim: {prefix}-{feather_type} ({cell.width}×{cell.height})")
        stripped = strip_bg(cell)
        trimmed = trim_alpha(stripped, pad=12)
        out = SORT_DIR / f"{prefix}-{feather_type}.png"
        trimmed.save(out, "PNG", optimize=True)
        print(f"   ✓ {out.name} ({trimmed.width}×{trimmed.height})")


def strip_file(name: str, out_name: str | None = None, trim: bool = True) -> None:
    """Strip background from one file, write back (or to out_name)."""
    src = SORT_DIR / name
    if not src.exists():
        print(f"   (skip {name} — not found)")
        return
    print(f"\n>> Stripping background: {name}")
    img = Image.open(src).convert("RGBA")
    stripped = strip_bg(img)
    if trim:
        stripped = trim_alpha(stripped, pad=6)
    dst = SORT_DIR / (out_name or name)
    stripped.save(dst, "PNG", optimize=True)
    print(f"   ✓ {dst.name} ({stripped.width}×{stripped.height})")


def crop_bird_frames(name: str = "bird-fly-frames.png", cols: int = 4, rows: int = 2) -> None:
    """Special handler — strip bg, then crop into individual frames AND keep a sprite-sheet.

    Strategy: strip bg from the whole sheet first so all frames share the same
    transparent canvas, then slice into frame files for code that prefers
    per-frame animations.
    """
    src = SORT_DIR / name
    if not src.exists():
        print(f"   (skip {name} — not found)")
        return
    print(f"\n>> Bird sprite sheet: {name}")
    img = Image.open(src).convert("RGBA")
    print("   stripping background from full sheet (this preserves frame alignment)")
    stripped = strip_bg(img)
    # Re-save the sheet with transparency intact (don't trim — frames must
    # stay grid-aligned for CSS background-position animation).
    sheet_out = SORT_DIR / name
    stripped.save(sheet_out, "PNG", optimize=True)
    print(f"   ✓ {sheet_out.name} ({stripped.width}×{stripped.height}) — sheet ready")

    cell_w = stripped.width // cols
    cell_h = stripped.height // rows
    frame_dir = SORT_DIR / "bird-frames"
    frame_dir.mkdir(exist_ok=True)
    for i in range(cols * rows):
        c = i % cols
        r = i // cols
        box = (c * cell_w, r * cell_h, (c + 1) * cell_w, (r + 1) * cell_h)
        frame = stripped.crop(box)
        # Trim per-frame for individual-img use.
        trimmed = trim_alpha(frame, pad=8)
        out = frame_dir / f"frame-{i + 1}.png"
        trimmed.save(out, "PNG", optimize=True)
    print(f"   ✓ {cols * rows} individual frames → public/media/sort/bird-frames/")


def main() -> None:
    if not SORT_DIR.exists():
        print(f"!! {SORT_DIR} doesn't exist", file=sys.stderr)
        sys.exit(1)

    # 1. Feather grid.
    feather_grid = SORT_DIR / "feather-{type}.png"
    if feather_grid.exists():
        crop_grid(feather_grid, "feather")
        feather_grid.unlink()
        print(f"   ✗ removed source feather-{{type}}.png")

    # 2. Nest grid.
    nest_grid = SORT_DIR / "nest-{type}.png"
    if nest_grid.exists():
        crop_grid(nest_grid, "nest")
        nest_grid.unlink()
        print(f"   ✗ removed source nest-{{type}}.png")

    # 3. Single-subject files: strip + trim.
    strip_file("bird-fly.png")
    strip_file("spider-creep.png")
    strip_file("spider-eating.png")

    # 4. Bird sprite sheet (special handling — sheet stays grid-aligned).
    crop_bird_frames("bird-fly-frames.png")

    print("\nDone.")


if __name__ == "__main__":
    main()

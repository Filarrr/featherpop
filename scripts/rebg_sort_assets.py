"""
Real AI background removal for the Feather Sort assets using rembg with
the birefnet-general-lite model (already on disk at ~/.u2net/). Replaces
the chroma-key halos with clean cutouts.

Run: python scripts/rebg_sort_assets.py
"""

from pathlib import Path
from PIL import Image
from rembg import remove, new_session
import io
import sys

SORT_DIR = Path("public/media/sort").resolve()
SESSION = new_session("birefnet-general-lite")

GRID_TYPES = ["falcon", "courage", "wind", "confidence", "wisdom", "joy"]


def bg_strip(img: Image.Image) -> Image.Image:
    out = remove(img, session=SESSION, alpha_matting=False, post_process_mask=True)
    if isinstance(out, bytes):
        out = Image.open(io.BytesIO(out))
    return out.convert("RGBA")


def trim_alpha(img: Image.Image, pad: int = 12) -> Image.Image:
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    alpha = img.split()[3]
    bbox = alpha.getbbox()
    if not bbox:
        return img
    l, t, r, b = bbox
    return img.crop((max(0, l - pad), max(0, t - pad),
                     min(img.width, r + pad), min(img.height, b + pad)))


def compress(img: Image.Image, max_dim: int = 720) -> Image.Image:
    """Cap longest dimension to keep files small. Maintains aspect ratio."""
    w, h = img.size
    scale = min(1.0, max_dim / max(w, h))
    if scale < 1.0:
        nw, nh = int(w * scale), int(h * scale)
        img = img.resize((nw, nh), Image.LANCZOS)
    return img


def reprocess_subject(name: str, max_dim: int = 720, pad: int = 8) -> None:
    src = SORT_DIR / name
    if not src.exists():
        print(f"[skip] {name}")
        return
    print(f"[strip] {name}")
    img = Image.open(src).convert("RGBA")
    stripped = bg_strip(img)
    trimmed = trim_alpha(stripped, pad=pad)
    small = compress(trimmed, max_dim=max_dim)
    small.save(src, "PNG", optimize=True)
    print(f"  -> {small.width}x{small.height}, {src.stat().st_size // 1024} KB")


def reprocess_bird_sheet(name: str = "bird-fly-frames.png") -> None:
    """Strip bg while keeping the 4x2 grid alignment intact."""
    src = SORT_DIR / name
    if not src.exists():
        print(f"[skip] {name}")
        return
    print(f"[strip sheet] {name}")
    img = Image.open(src).convert("RGBA")
    stripped = bg_strip(img)
    # Keep grid alignment - don't trim. Compress moderately so CSS sprite still works.
    small = compress(stripped, max_dim=1200)
    small.save(src, "PNG", optimize=True)
    print(f"  -> {small.width}x{small.height}, {src.stat().st_size // 1024} KB")


def main() -> None:
    if not SORT_DIR.exists():
        print(f"!! {SORT_DIR} doesn't exist", file=sys.stderr); sys.exit(1)

    # Feathers + nests (already split, just re-strip)
    for t in GRID_TYPES:
        reprocess_subject(f"feather-{t}.png", max_dim=512, pad=10)
        reprocess_subject(f"nest-{t}.png", max_dim=512, pad=10)

    # Bird hero + spider stills
    reprocess_subject("bird-fly.png", max_dim=900, pad=12)
    reprocess_subject("spider-creep.png", max_dim=600, pad=8)
    reprocess_subject("spider-eating.png", max_dim=700, pad=8)

    # Bird sprite sheet keeps grid alignment
    reprocess_bird_sheet("bird-fly-frames.png")

    print("\nDone.")


if __name__ == "__main__":
    main()

"""
Rename + background-strip + compress the client-uploaded ChatGPT prize PNGs.

Mapping is hard-coded (file mtime order matches the order they were
generated in chat):
  ChatGPT Image ... 01_40_47 PM.png  ->  sticker.png         (holographic sticker)
  ChatGPT Image ... 01_40_54 PM.png  ->  bookmark.png        (FEATHER QUEST bookmark)
  ChatGPT Image ... 01_41_01 PM.png  ->  patch.png           (CHAMPION patch)
  ChatGPT Image ... 01_41_09 PM.png  ->  glitter-badge.png   (crowned feather pin)
  ChatGPT Image ... 01_41_16 PM.png  ->  gold-frame.png      (ornate frame)

Run: python scripts/process_prize_assets.py
"""

from pathlib import Path
from PIL import Image
from rembg import remove, new_session
import io
import sys
import shutil

REWARDS_DIR = Path("public/media/rewards").resolve()
SESSION = new_session("birefnet-general-lite")

# Filename (sorted prefix → id). The script picks the matching files by
# substring so timestamps don't have to be exact.
MAPPING = [
    ("01_40_47", "sticker"),
    ("01_40_54", "bookmark"),
    ("01_41_01", "patch"),
    ("01_41_09", "glitter-badge"),
    ("01_41_16", "gold-frame"),
]


def bg_strip(img: Image.Image) -> Image.Image:
    out = remove(img, session=SESSION, alpha_matting=False, post_process_mask=True)
    if isinstance(out, bytes):
        out = Image.open(io.BytesIO(out))
    return out.convert("RGBA")


def trim_alpha(img: Image.Image, pad: int = 14) -> Image.Image:
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    a = img.split()[3]
    bbox = a.getbbox()
    if not bbox:
        return img
    l, t, r, b = bbox
    return img.crop((max(0, l - pad), max(0, t - pad),
                     min(img.width, r + pad), min(img.height, b + pad)))


def compress(img: Image.Image, max_dim: int = 720) -> Image.Image:
    w, h = img.size
    scale = min(1.0, max_dim / max(w, h))
    if scale < 1.0:
        img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    return img


def process_one(src: Path, dst: Path, max_dim: int = 720, pad: int = 14) -> None:
    print(f"[strip] {src.name} -> {dst.name}")
    img = Image.open(src).convert("RGBA")
    stripped = bg_strip(img)
    trimmed = trim_alpha(stripped, pad=pad)
    small = compress(trimmed, max_dim=max_dim)
    small.save(dst, "PNG", optimize=True)
    kb = dst.stat().st_size // 1024
    print(f"  -> {small.width}x{small.height} ({kb} KB)")


def main() -> None:
    if not REWARDS_DIR.exists():
        print(f"!! {REWARDS_DIR} missing", file=sys.stderr); sys.exit(1)

    src_files = sorted(REWARDS_DIR.glob("ChatGPT Image*.png"))
    if not src_files:
        print("(no ChatGPT Image*.png files found — nothing to do)")
        return

    backup_dir = REWARDS_DIR / "_originals"
    backup_dir.mkdir(exist_ok=True)

    for prefix, prize_id in MAPPING:
        matches = [p for p in src_files if prefix in p.name]
        if not matches:
            print(f"(skip {prize_id} — no source file with '{prefix}')")
            continue
        src = matches[0]
        # Back up the raw original before overwriting.
        backup = backup_dir / src.name
        if not backup.exists():
            shutil.copy2(src, backup)
        # Process + write to id name.
        dst = REWARDS_DIR / f"{prize_id}.png"
        process_one(src, dst, max_dim=720, pad=14)
        # Remove the raw timestamped file from the public folder so we
        # don't ship it.
        src.unlink()

    print("\nDone. Originals backed up to public/media/rewards/_originals/")


if __name__ == "__main__":
    main()

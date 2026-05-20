// Crop the pose-number labels ("1. IDLE", "3. CHEER", etc.) off the bottom
// of each kid/sheet PNG. The labels live in roughly the bottom ~10% of each
// frame after the bg was already removed.
//
// Strategy: scan each row from the bottom upward; find the lowest non-
// transparent row that belongs to the *character* (i.e. has a contiguous
// run of opaque pixels at least ~25% of the image width). Below the label
// area, character pixels are sparse (just the thin glyphs). Crop everything
// below the first "real character" row.
//
// Safer alternative: just crop the bottom 12% of each affected frame, which
// is what we do here — it's simpler, deterministic, and the source images
// have consistent padding.

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const TARGETS = [
  // Ms. Feather Pop sliced sheet frames (have "1. IDLE" etc. labels)
  "feather-pop-sheet-idle.png",
  "feather-pop-sheet-wave.png",
  "feather-pop-sheet-cheer.png",
  "feather-pop-sheet-think.png",
  "feather-pop-sheet-hint.png",
  "feather-pop-sheet-oops.png",
  // Kid frames — every pose
  ...["ari", "bee", "kai", "lila", "mo", "zara"].flatMap((k) =>
    ["idle", "wave", "cheer", "read", "jump"].map((p) => `kid-${k}-${p}.png`),
  ),
];

const DIR = "public/media/avatars";
const TRIM_PERCENT = 0.12; // crop bottom 12% — empirically right for these sheets

for (const file of TARGETS) {
  const abs = path.join(DIR, file);
  try {
    await fs.access(abs);
  } catch {
    console.log("skip (missing):", file);
    continue;
  }

  const meta = await sharp(abs).metadata();
  const newH = Math.floor(meta.height * (1 - TRIM_PERCENT));
  const buf = await sharp(abs)
    .extract({ left: 0, top: 0, width: meta.width, height: newH })
    .png()
    .toBuffer();
  await fs.writeFile(abs, buf);
  console.log(`✓ ${file}  (${meta.height} → ${newH})`);
}

console.log("\nDone cropping pose labels.");

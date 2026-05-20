// Run AI background removal on every PNG in public/media/avatars/ and
// public/media/scenes/group-cheer.png. Saves the result in-place (overwrites).
// On first run it downloads ~80MB of ONNX model weights to node_modules,
// then runs fully offline.

import fs from "node:fs/promises";
import path from "node:path";
import { removeBackground } from "@imgly/background-removal-node";

const TARGETS = [
  // Ms. Feather Pop — all single-pose PNGs
  "public/media/avatars/feather-pop-idle.png",
  "public/media/avatars/feather-pop-wave.png",
  "public/media/avatars/feather-pop-cheer.png",
  "public/media/avatars/feather-pop-think.png",
  "public/media/avatars/feather-pop-hint.png",
  "public/media/avatars/feather-pop-oops.png",
  "public/media/avatars/feather-pop-wow.png",
  "public/media/avatars/feather-pop-head.png",

  // Mouth sprites for lip-sync
  "public/media/avatars/feather-pop-mouth-1.png",
  "public/media/avatars/feather-pop-mouth-2.png",
  "public/media/avatars/feather-pop-mouth-3.png",
  "public/media/avatars/feather-pop-mouth-4.png",

  // Kids — every pose for every kid
  ...["ari", "bee", "kai", "lila", "mo", "zara"].flatMap((k) =>
    ["idle", "wave", "cheer", "read", "jump"].map(
      (p) => `public/media/avatars/kid-${k}-${p}.png`,
    ),
  ),

  // Reward / UI characters
  "public/media/scenes/reward-burst.png",
  "public/media/scenes/trophy.png",
  "public/media/scenes/confetti-sprites.png",
  "public/media/ui/coin.png",
  "public/media/ui/scan-illo.png",
  "public/media/ui/badges.png",
  "public/media/ui/alphabet-tiles.png",
];

// Skip zone backgrounds — they are full-bleed scenes, no transparency needed.
// Also skip group-cheer.png — it's a full scene with park background.

let done = 0;
let skipped = 0;
let failed = 0;

for (const rel of TARGETS) {
  const abs = path.resolve(rel);
  try {
    await fs.access(abs);
  } catch {
    console.log("skip (missing):", rel);
    skipped++;
    continue;
  }

  try {
    const t0 = Date.now();
    // Pass the file as a Blob to dodge Windows-path URL parsing
    const srcBuf = await fs.readFile(abs);
    const inputBlob = new Blob([srcBuf], { type: "image/png" });
    const outBlob = await removeBackground(inputBlob);
    const buf = Buffer.from(await outBlob.arrayBuffer());
    await fs.writeFile(abs, buf);
    const ms = Date.now() - t0;
    console.log(`✓ ${rel}  (${(buf.length / 1024).toFixed(0)} KB, ${ms} ms)`);
    done++;
  } catch (err) {
    console.error(`✗ ${rel}:`, err.message);
    failed++;
  }
}

console.log(`\nFinished: ${done} done, ${skipped} skipped, ${failed} failed.`);

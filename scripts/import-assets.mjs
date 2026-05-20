// One-shot import script. Reads the ChatGPT-generated images from the loose
// folders the client dropped into the project root, then:
//   1. Copies single-pose PNGs to /public/media/{avatars,scenes,ui}/ with
//      canonical names.
//   2. Slices composite sheets (Ms. Feather Pop 6-pose grid, 4-mouth grid,
//      and the 5-pose kid strips) into individual frames.
//
// Run with: node scripts/import-assets.mjs

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const AVATARS = path.join(ROOT, "public", "media", "avatars");
const SCENES = path.join(ROOT, "public", "media", "scenes");
const UI = path.join(ROOT, "public", "media", "ui");

await fs.mkdir(AVATARS, { recursive: true });
await fs.mkdir(SCENES, { recursive: true });
await fs.mkdir(UI, { recursive: true });

const log = (msg) => console.log("•", msg);

/* ----------------------------------------------------------
 * Step 1 — Ms. Feather Pop single-pose images
 * ----------------------------------------------------------
 *   (2) IDLE   (3) WAVE   (4) CHEER
 *   (5) THINK  (6) HINT   (7) OOPS
 *   (8) WOW    (9) HEAD CLOSE-UP
 *   (1) is the 6-pose character sheet (composite, sliced below)
 *   (10) is the 4-mouth grid (composite, sliced below)
 * -------------------------------------------------------- */
const FP_SRC = path.join(ROOT, "ms featherpop");
const FP_MAP = {
  "ChatGPT Image May 20, 2026, 05_29_55 PM (2).png": "feather-pop-idle.png",
  "ChatGPT Image May 20, 2026, 05_29_56 PM (3).png": "feather-pop-wave.png",
  "ChatGPT Image May 20, 2026, 05_29_58 PM (4).png": "feather-pop-cheer.png",
  "ChatGPT Image May 20, 2026, 05_30_02 PM (5).png": "feather-pop-think.png",
  "ChatGPT Image May 20, 2026, 05_30_03 PM (6).png": "feather-pop-hint.png",
  "ChatGPT Image May 20, 2026, 05_30_04 PM (7).png": "feather-pop-oops.png",
  "ChatGPT Image May 20, 2026, 05_30_06 PM (8).png": "feather-pop-wow.png",
  "ChatGPT Image May 20, 2026, 05_30_07 PM (9).png": "feather-pop-head.png",
};

for (const [src, dest] of Object.entries(FP_MAP)) {
  const from = path.join(FP_SRC, src);
  const to = path.join(AVATARS, dest);
  await fs.copyFile(from, to);
  log(`copied  → ${dest}`);
}

/* Ms. Feather Pop 6-pose sheet (3 cols × 2 rows) */
{
  const src = path.join(
    FP_SRC,
    "ChatGPT Image May 20, 2026, 05_29_52 PM (1).png",
  );
  const meta = await sharp(src).metadata();
  const cols = 3,
    rows = 2;
  const w = Math.floor(meta.width / cols);
  const h = Math.floor(meta.height / rows);
  // Layout (per the rendered sheet):
  // row 0: idle | wave | cheer
  // row 1: think | hint | oops
  const order = [
    "feather-pop-sheet-idle.png",
    "feather-pop-sheet-wave.png",
    "feather-pop-sheet-cheer.png",
    "feather-pop-sheet-think.png",
    "feather-pop-sheet-hint.png",
    "feather-pop-sheet-oops.png",
  ];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const out = path.join(AVATARS, order[idx]);
      await sharp(src)
        .extract({ left: c * w, top: r * h, width: w, height: h })
        .png()
        .toFile(out);
      log(`sliced  → ${order[idx]}`);
    }
  }
}

/* Ms. Feather Pop 4-mouth sheet (2 cols × 2 rows) */
{
  const src = path.join(
    FP_SRC,
    "ChatGPT Image May 20, 2026, 05_30_08 PM (10).png",
  );
  const meta = await sharp(src).metadata();
  const cols = 2,
    rows = 2;
  const w = Math.floor(meta.width / cols);
  const h = Math.floor(meta.height / rows);
  // Layout (per the rendered sheet, reading order):
  // 1 closed-smile | 2 slight-open (ee)
  // 3 mid-open (ah) | 4 round-open (oh)
  const order = [
    "feather-pop-mouth-1.png",
    "feather-pop-mouth-2.png",
    "feather-pop-mouth-3.png",
    "feather-pop-mouth-4.png",
  ];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const out = path.join(AVATARS, order[idx]);
      await sharp(src)
        .extract({ left: c * w, top: r * h, width: w, height: h })
        .png()
        .toFile(out);
      log(`sliced  → ${order[idx]}`);
    }
  }
}

/* ----------------------------------------------------------
 * Step 2 — Kid character strips (5 cols × 1 row each)
 * Order on each sheet: IDLE | WAVE | CHEER | READ | JUMP
 * -------------------------------------------------------- */
const KIDS_SRC = path.join(ROOT, "the kids");
const KID_SHEETS = {
  ari:  "ChatGPT Image May 20, 2026, 05_45_39 PM (1).png",
  bee:  "ChatGPT Image May 20, 2026, 05_45_40 PM (2).png",
  kai:  "ChatGPT Image May 20, 2026, 05_45_40 PM (3).png",
  lila: "ChatGPT Image May 20, 2026, 05_45_41 PM (4).png",
  mo:   "ChatGPT Image May 20, 2026, 05_45_41 PM (5).png",
  zara: "ChatGPT Image May 20, 2026, 05_45_42 PM (6).png",
};
const KID_POSES = ["idle", "wave", "cheer", "read", "jump"];

for (const [name, file] of Object.entries(KID_SHEETS)) {
  const src = path.join(KIDS_SRC, file);
  const meta = await sharp(src).metadata();
  const cols = 5;
  const w = Math.floor(meta.width / cols);
  const h = meta.height;
  for (let c = 0; c < cols; c++) {
    const out = path.join(AVATARS, `kid-${name}-${KID_POSES[c]}.png`);
    await sharp(src)
      .extract({ left: c * w, top: 0, width: w, height: h })
      .png()
      .toFile(out);
    log(`sliced  → kid-${name}-${KID_POSES[c]}.png`);
  }
}

/* Group hero shot (Ms. Feather Pop + 6 kids in a park) */
{
  const src = path.join(
    KIDS_SRC,
    "ChatGPT Image May 20, 2026, 05_45_42 PM (7).png",
  );
  await fs.copyFile(src, path.join(SCENES, "group-cheer.png"));
  log("copied  → scenes/group-cheer.png");
}

/* ----------------------------------------------------------
 * Step 3 — Reward visuals
 * -------------------------------------------------------- */
const REWARDS_SRC = path.join(ROOT, "reward visuals");
const REWARDS_MAP = {
  "ChatGPT Image May 20, 2026, 05_48_52 PM (1).png": "reward-burst.png",
  "ChatGPT Image May 20, 2026, 05_48_56 PM (2).png": "trophy.png",
  "ChatGPT Image May 20, 2026, 05_48_57 PM (3).png": "confetti-sprites.png",
};
for (const [src, dest] of Object.entries(REWARDS_MAP)) {
  await fs.copyFile(path.join(REWARDS_SRC, src), path.join(SCENES, dest));
  log(`copied  → scenes/${dest}`);
}

/* ----------------------------------------------------------
 * Step 4 — Quest zone backgrounds
 * Order matches the prompt list in ASSET_PROMPTS.md §5:
 *   1 Feather Forest  2 Sky Stage  3 Adventure Trail
 *   4 Pop Park        5 Star Stage 6 Reading Nest
 * -------------------------------------------------------- */
const ZONES_SRC = path.join(ROOT, "quest zone background");
const ZONES_MAP = {
  "ChatGPT Image May 20, 2026, 05_52_48 PM (1).png": "zone-feather-forest.png",
  "ChatGPT Image May 20, 2026, 05_52_49 PM (2).png": "zone-sky-stage.png",
  "ChatGPT Image May 20, 2026, 05_52_50 PM (3).png": "zone-adventure-trail.png",
  "ChatGPT Image May 20, 2026, 05_52_50 PM (4).png": "zone-pop-park.png",
  "ChatGPT Image May 20, 2026, 05_52_51 PM (5).png": "zone-star-stage.png",
  "ChatGPT Image May 20, 2026, 05_52_51 PM (6).png": "zone-reading-nest.png",
};
for (const [src, dest] of Object.entries(ZONES_MAP)) {
  await fs.copyFile(path.join(ZONES_SRC, src), path.join(SCENES, dest));
  log(`copied  → scenes/${dest}`);
}

/* ----------------------------------------------------------
 * Step 5 — UI iconography
 * -------------------------------------------------------- */
const UI_SRC = path.join(ROOT, "UI iconography");
const UI_MAP = {
  "ChatGPT Image May 20, 2026, 06_08_08 PM.png": "alphabet-tiles.png",
  "ChatGPT Image May 20, 2026, 06_13_25 PM.png": "scan-illo.png",
  "ChatGPT Image May 20, 2026, 06_14_26 PM.png": "badges.png",
  "ChatGPT Image May 20, 2026, 06_14_37 PM.png": "coin.png",
};
for (const [src, dest] of Object.entries(UI_MAP)) {
  await fs.copyFile(path.join(UI_SRC, src), path.join(UI, dest));
  log(`copied  → ui/${dest}`);
}

console.log("\n✓ Asset import complete.");

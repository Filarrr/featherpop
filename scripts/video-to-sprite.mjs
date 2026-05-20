// Transparent-video pipeline (Windows-friendly):
//   1. ffmpeg extracts N evenly-spaced frames per video.
//   2. For each frame, spawn `bg-remove-one.mjs` subprocess (avoids the
//      sharp×onnxruntime native-lib clash on Windows).
//   3. sharp stitches the N transparent frames into one horizontal sprite
//      sheet PNG.
//   4. CSS plays it back via steps(N) animation (see globals.css).

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";

const FRAMES = 12;
const FRAME_SIZE = 360;

const ALL_POSES = ["idle", "wave", "cheer", "think", "hint", "oops", "wow"];
const argPose = process.argv[2];
const POSES = argPose ? [argPose] : ALL_POSES;
const SRC_DIR = "public/media/avatars";

function runProc(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    p.stderr.on("data", (d) => (stderr += d.toString()));
    p.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${cmd} exit ${code}\n${stderr.split("\n").slice(-3).join("\n")}`)),
    );
  });
}

async function durationOf(file) {
  return new Promise((resolve, reject) => {
    const p = spawn("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      file,
    ], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    p.stdout.on("data", (d) => (out += d.toString()));
    p.on("close", () => resolve(parseFloat(out.trim()) || 1));
    p.on("error", reject);
  });
}

for (const pose of POSES) {
  const mp4 = path.join(SRC_DIR, `feather-pop-${pose}.mp4`);
  const outSprite = path.join(SRC_DIR, `feather-pop-${pose}.sprite.png`);

  try {
    await fs.access(mp4);
  } catch {
    console.log(`skip ${pose} (no .mp4)`);
    continue;
  }

  const t0 = Date.now();
  const dur = await durationOf(mp4);
  const fps = FRAMES / dur;

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), `fp-sprite-${pose}-`));
  try {
    // Step 1: extract N frames at FRAME_SIZE (no chromakey)
    await runProc("ffmpeg", [
      "-y",
      "-i", mp4,
      "-vf",
      `fps=${fps.toFixed(4)},scale=${FRAME_SIZE}:${FRAME_SIZE}:force_original_aspect_ratio=decrease,pad=${FRAME_SIZE}:${FRAME_SIZE}:(ow-iw)/2:(oh-ih)/2:color=0x4e6873`,
      "-frames:v", String(FRAMES),
      path.join(tmpDir, "%04d.png"),
    ]);

    // Step 2: AI bg-remove each frame in its own subprocess
    const files = (await fs.readdir(tmpDir))
      .filter((f) => f.endsWith(".png"))
      .sort()
      .slice(0, FRAMES);
    if (files.length < FRAMES) {
      throw new Error(`only ${files.length}/${FRAMES} frames extracted`);
    }
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const abs = path.join(tmpDir, f);
      await runProc(process.execPath, ["scripts/bg-remove-one.mjs", abs]);
      process.stdout.write(`\r  ${pose}: bg-removed ${i + 1}/${FRAMES} frames`);
    }
    process.stdout.write("\n");

    // Step 3: stitch (sharp loaded ONLY in this process — @imgly never was)
    const composite = files.map((f, i) => ({
      input: path.join(tmpDir, f),
      left: i * FRAME_SIZE,
      top: 0,
    }));
    await sharp({
      create: {
        width: FRAME_SIZE * FRAMES,
        height: FRAME_SIZE,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite(composite)
      .png({ compressionLevel: 9 })
      .toFile(outSprite);

    const size = (await fs.stat(outSprite)).size;
    console.log(
      `✓ ${pose}  ${(size / 1024).toFixed(0)} KB  ${((Date.now() - t0) / 1000).toFixed(1)}s\n`,
    );
  } catch (err) {
    console.error(`✗ ${pose}:`, err.message);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

console.log(`Done. Sprite: ${FRAMES} frames × ${FRAME_SIZE}px square.`);

// Strip the teal-gray background out of the Ms. Feather Pop pose videos
// and emit transparent WebM siblings next to each MP4.
//
// Uses ffmpeg's `colorkey` filter (similarity + smooth-edge blend), then
// re-encodes as VP9 with yuva420p so the alpha channel survives. Modern
// browsers play this with <video> just like an MP4.

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const KEY = "0x4e6873";    // dark teal-gray bg (RGB ~78,104,115)
const SIMILARITY = "0.18"; // 0-1, how aggressively to match the bg
const BLEND = "0.10";      // edge softness so feather/hair tips don't crunch

const DIR = "public/media/avatars";
const POSES = ["idle", "wave", "cheer", "think", "hint", "oops", "wow"];

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    p.stderr.on("data", (d) => (stderr += d.toString()));
    p.on("close", (code) => {
      if (code === 0) resolve(stderr);
      else reject(new Error(`exit ${code}\n${stderr}`));
    });
  });
}

for (const pose of POSES) {
  const mp4 = path.join(DIR, `feather-pop-${pose}.mp4`);
  const webm = path.join(DIR, `feather-pop-${pose}.webm`);
  try {
    await fs.access(mp4);
  } catch {
    console.log(`skip ${pose} (no .mp4)`);
    continue;
  }

  const t0 = Date.now();
  const args = [
    "-y",
    "-i", mp4,
    "-vf", `colorkey=${KEY}:${SIMILARITY}:${BLEND},format=yuva420p`,
    "-c:v", "libvpx-vp9",
    "-pix_fmt", "yuva420p",
    "-auto-alt-ref", "0",   // required for VP9 alpha
    "-b:v", "1200k",
    "-an",                   // strip audio
    webm,
  ];
  try {
    await run("ffmpeg", args);
    const size = (await fs.stat(webm)).size;
    console.log(`✓ ${pose}  ${(size / 1024).toFixed(0)} KB  ${Date.now() - t0} ms`);
  } catch (err) {
    console.error(`✗ ${pose}:`, err.message.split("\n").slice(-3).join("\n"));
  }
}

console.log("\nDone.");

// Quick PNG inspector: tells us if a file has true alpha or fake checker.
import sharp from "sharp";

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/inspect-image.mjs <path>");
  process.exit(1);
}

const meta = await sharp(file).metadata();
console.log("file:", file);
console.log("size:", meta.width, "x", meta.height);
console.log("channels:", meta.channels, "(4 = RGBA, 3 = RGB no alpha)");
console.log("hasAlpha:", meta.hasAlpha);

// Sample 8 corner pixels to see what's at the edges
const { data, info } = await sharp(file)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const W = info.width;
const H = info.height;
function px(x, y) {
  const i = (y * W + x) * 4;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
}

console.log("\nCorner pixels (r,g,b,a):");
console.log("  top-left    :", px(2, 2));
console.log("  top-right   :", px(W - 3, 2));
console.log("  bottom-left :", px(2, H - 3));
console.log("  bottom-right:", px(W - 3, H - 3));
console.log("  4-px-inset alternates (checker test):");
for (let i = 0; i < 6; i++) {
  console.log("   ", i, ":", px(4 + i * 16, 4));
}

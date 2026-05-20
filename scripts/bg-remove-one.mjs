// Background-remove a single PNG, overwriting in place. Tiny standalone
// script so the parent orchestrator can spawn one per frame and dodge the
// sharp×onnxruntime native-lib clash on Windows.

import fs from "node:fs/promises";
import { removeBackground } from "@imgly/background-removal-node";

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/bg-remove-one.mjs <file.png>");
  process.exit(1);
}

const srcBuf = await fs.readFile(file);
const blob = new Blob([srcBuf], { type: "image/png" });
const outBlob = await removeBackground(blob);
const outBuf = Buffer.from(await outBlob.arrayBuffer());
await fs.writeFile(file, outBuf);

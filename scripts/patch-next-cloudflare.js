const fs = require("node:fs");
const path = require("node:path");

const files = [
  "node_modules/next/dist/server/node-environment-extensions/fast-set-immediate.external.js",
  "node_modules/next/dist/esm/server/node-environment-extensions/fast-set-immediate.external.js",
];

const originalSnippet =
  "globalThis.setImmediate = nodeTimers.setImmediate = // Workaround for missing __promisify__ which is not a real property\n        patchedSetImmediate;\n        globalThis.clearImmediate = nodeTimers.clearImmediate = patchedClearImmediate;\n        const nodeTimersPromises = require('node:timers/promises');\n        nodeTimersPromises.setImmediate = patchedSetImmediatePromise;";

const patchedSnippet =
  "globalThis.setImmediate = patchedSetImmediate;\n        try {\n            nodeTimers.setImmediate = patchedSetImmediate;\n        } catch {}\n        globalThis.clearImmediate = patchedClearImmediate;\n        try {\n            nodeTimers.clearImmediate = patchedClearImmediate;\n        } catch {}\n        try {\n            const nodeTimersPromises = require('node:timers/promises');\n            nodeTimersPromises.setImmediate = patchedSetImmediatePromise;\n        } catch {}";

let patchedCount = 0;

for (const relativeFile of files) {
  const absoluteFile = path.join(process.cwd(), relativeFile);
  if (!fs.existsSync(absoluteFile)) continue;

  let source = fs.readFileSync(absoluteFile, "utf8");

  if (source.includes("try {\n            nodeTimers.setImmediate = patchedSetImmediate;")) {
    patchedCount += 1;
    continue;
  }

  if (!source.includes(originalSnippet)) {
    console.warn(`[patch-next-cloudflare] pattern not found: ${relativeFile}`);
    continue;
  }

  source = source.replace(originalSnippet, patchedSnippet);
  fs.writeFileSync(absoluteFile, source, "utf8");
  patchedCount += 1;
}

console.log(`[patch-next-cloudflare] patched ${patchedCount} file(s)`);

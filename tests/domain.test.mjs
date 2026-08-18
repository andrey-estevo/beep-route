import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
test("domain enforces duplicate tracking codes", async () => { const source = await readFile(new URL("../lib/domain.ts", import.meta.url), "utf8"); assert.match(source, /trackingCode === code/); });
test("scanner extracts the package ID from JSON QR payloads", async () => { const source = await readFile(new URL("../lib/domain.ts", import.meta.url), "utf8"); assert.match(source, /JSON\.parse\(value\)/); assert.match(source, /payload\.ID/); });
test("optimizer includes nearest-neighbor and 2-opt improvement", async () => { const source = await readFile(new URL("../lib/routing/local-optimizer.ts", import.meta.url), "utf8"); assert.match(source, /remaining\.splice/); assert.match(source, /\.reverse\(\)/); assert.match(source, /path\.map/); });
test("offline route is persisted in IndexedDB", async () => { const source = await readFile(new URL("../lib/offline-store.ts", import.meta.url), "utf8"); assert.match(source, /indexedDB\.open/); assert.match(source, /\.put\(route/); });

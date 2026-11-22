// Checks the module that plugin.json contributes to agents.makers. Core grants the page of the agents plugin only that one file
// of this plugin (core docs/spec/plugins.md), so an import of any other file of this plugin is refused and the group fails to load.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { init, parse } from "es-module-lexer";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const [item] = JSON.parse(read("plugin.json")).contributes["agents.makers"];

test("the contributed module has no static or dynamic import", async () => {
  await init;
  const [imports] = parse(read(item.module), item.module);
  assert.deepEqual(imports.map((entry) => entry.n ?? read(item.module).slice(entry.s, entry.e)), []);
});

test("the contributed module exports the function group with the group files", async () => {
  const { group } = await import(`../${item.module}`);
  const value = group();
  assert.equal(value.id, "harness");
  assert.ok(value.files.length > 0, "the group has no files");
});

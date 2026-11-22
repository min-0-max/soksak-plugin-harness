// Checks the declarations of plugin.json, its group module and package.json with literal expectations.
// The application validates plugin.json at installation.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { validateManifest } from "./fixtures/manifest-rules.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const exists = (path) => existsSync(new URL(`../${path}`, import.meta.url));
const manifest = JSON.parse(read("plugin.json"));
const pkg = JSON.parse(read("package.json"));

test("plugin.json declares the plugin harness with its name and description", () => {
  assert.equal(manifest.id, "harness");
  assert.equal(manifest.name, "하네스");
  assert.equal(manifest.description, "agents plugin의 메이커 group harness를 기여한다. 화면 surface는 없다.");
});

test("plugin.json lists the agents plugin as its dependency and contributes the harness group to agents.makers", () => {
  assert.deepEqual(manifest.dependencies, { "@soksak/plugin-agents": "^0.0.1" });
  assert.deepEqual(manifest.contributes, { "agents.makers": [{ range: "^0.0.1", module: "maker/group.js" }] });
});

test("plugin.json declares no surface, sections or stored data", () => {
  for (const member of ["surface", "sections", "sidebars", "data", "sessions", "background", "events", "extends"]) {
    assert.equal(manifest[member], undefined, `plugin.json declares ${member}`);
  }
  assert.equal(exists("ui"), false, "ui/ still exists");
});

test("the contributed module exports the harness group with its project folder", () => {
  assert.ok(exists("maker/group.js"), "maker/group.js is missing");
  const source = read("maker/group.js");
  assert.match(source, /export const group = Object\.freeze\(\{\n  id: "harness",\n  projectFolder: "\.harness",\n\}\);/);
});

test("plugin.json passes the declaration rules with its module present", () => {
  assert.deepEqual(validateManifest(manifest, { exists }), []);
});

test("package.json names the plugin release folders and runs the tests of test/", () => {
  assert.equal(pkg.name, "@soksak/plugin-harness");
  assert.equal(pkg.private, true);
  assert.deepEqual(pkg.files, ["maker", "plugin.json"]);
  assert.equal(pkg.scripts.test, "node --test --test-timeout=120000 test/");
  assert.equal(pkg.engines.soksak, "^0.0.41");
});

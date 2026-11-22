// Checks that the declaration rules refuse each invalid manifest with its reason, and accept the valid one.
import assert from "node:assert/strict";
import test from "node:test";
import { validateManifest } from "./fixtures/manifest-rules.mjs";

const valid = () => ({
  id: "harness",
  name: "하네스",
  description: "agents plugin의 메이커 group harness를 기여한다. 화면 surface는 없다.",
  dependencies: { "@soksak/plugin-agents": "^0.0.1" },
  contributes: { "agents.makers": [{ range: "^0.0.1", module: "maker/group.js" }] },
});
const exists = () => true;

test("a valid manifest is accepted", () => {
  assert.deepEqual(validateManifest(valid(), { exists }), []);
});

test("each invalid manifest is refused with its reason", () => {
  const cases = [
    ["an unknown member", (m) => ({ ...m, host: "ui/host.html" }), ["unknown member host"]],
    ["a surface", (m) => ({ ...m, surface: { composition: {} } }), ["this plugin must not declare surface"]],
    ["sections", (m) => ({ ...m, sections: [] }), ["this plugin must not declare sections"]],
    ["an id that is core", (m) => ({ ...m, id: "core" }), ['id "core" must match [a-z][a-z0-9-]* and must not be core']],
    ["an empty description", (m) => ({ ...m, description: "" }), ["description must be 1 to 200 characters"]],
    ["a description of 201 characters", (m) => ({ ...m, description: "가".repeat(201) }), ["description must be 1 to 200 characters"]],
    ["no dependency on the provider", (m) => ({ ...m, dependencies: {} }), ["contributes agents.makers requires the dependency @soksak/plugin-agents"]],
    ["a point without a plugin id", (m) => ({ ...m, contributes: { makers: [{ range: "^0.0.1", module: "maker/group.js" }] } }), ["contributes point makers must be <plugin id>.<point>"]],
    ["an absolute module path", (m) => ({ ...m, contributes: { "agents.makers": [{ range: "^0.0.1", module: "/maker/group.js" }] } }), ["contributes agents.makers: module /maker/group.js must be relative"]],
    ["a module that leaves the plugin folder", (m) => ({ ...m, contributes: { "agents.makers": [{ range: "^0.0.1", module: "../group.js" }] } }), ["contributes agents.makers: module ../group.js has an empty, \".\" or \"..\" segment"]],
    ["a module that is not a .js file", (m) => ({ ...m, contributes: { "agents.makers": [{ range: "^0.0.1", module: "maker/group.mjs" }] } }), ["contributes agents.makers: module maker/group.mjs must end in .js"]],
    ["a contribution without a range", (m) => ({ ...m, contributes: { "agents.makers": [{ module: "maker/group.js" }] } }), ["contributes agents.makers has an invalid range undefined"]],
    ["an empty contribution list", (m) => ({ ...m, contributes: { "agents.makers": [] } }), ["contributes agents.makers must be a non-empty array"]],
    ["a dependency with an invalid range", (m) => ({ ...m, dependencies: { "@soksak/plugin-agents": "latest" } }), ["dependency @soksak/plugin-agents has an invalid range \"latest\""]],
    ["neither surface, sections nor contributes", (m) => { const { contributes, ...rest } = m; return rest; }, ["a plugin requires surface, sections or contributes"]],
  ];
  for (const [label, change, expected] of cases) {
    assert.deepEqual(validateManifest(change(valid()), { exists }), expected, label);
  }
});

test("a module that the plugin folder does not contain is refused", () => {
  assert.deepEqual(validateManifest(valid(), { exists: () => false }), ["contributes agents.makers: module maker/group.js does not exist"]);
});

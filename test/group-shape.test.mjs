// Checks the group object that maker/group.js returns, with literal expectations, against the group object of the agents.makers interface (agents docs/spec/makers.md).
import assert from "node:assert/strict";
import test from "node:test";
import { group } from "../maker/group.js";

test("maker/group.js exports the function group", () => {
  assert.equal(typeof group, "function");
});

test("group() returns the harness group object with the members of the interface", () => {
  assert.deepEqual(Object.keys(group()).sort(), [
    "agents", "clis", "files", "folders", "id", "name", "path", "plugin", "rules", "skills", "variables",
  ]);
});

test("the group id and name are the id and name of the contributed item", () => {
  const value = group();
  assert.equal(value.id, "harness");
  assert.equal(value.name, "하네스");
});

test("the plugin folder and the skill folders are relative paths inside maker/", () => {
  const value = group();
  assert.equal(value.plugin, "plugin");
  assert.deepEqual(value.skills, ["skills/harness", "skills/evolve"]);
  for (const path of [value.plugin, ...value.skills]) {
    assert.ok(!path.startsWith("/") && !path.split("/").includes(".."), path);
  }
});

// The upstream harness defines its agents at run time in the project; it ships no agent definition file.

// The upstream is a Claude Code plugin, so the group runs claude only.
test("the harness group runs claude only", () => {
  assert.deepEqual(group().clis, ["claude"]);
});

test("the harness group sets no variables and prepends no PATH folders", () => {
  assert.deepEqual(group().variables, {});
  assert.deepEqual(group().path, []);
});

// The group has one agent, whose definition path is the harness skill file; an invited agent needs a group agent to exist.
test("the group has one harness agent whose definition path is the harness SKILL.md", () => {
  assert.deepEqual(group().agents, [{ name: "harness", cli: "claude", path: ".claude/skills/harness/SKILL.md" }]);
});

// The upstream harness writes agent definitions to .claude/agents/, skills to .claude/skills/ and CLAUDE.md, as its SKILL.md states.
test("the group creates only the .claude/ folder in the project", () => {
  assert.deepEqual(group().folders, [".claude/"]);
});

test("the rules name the agent and skill locations inside .claude/", () => {
  const value = group();
  assert.ok(value.rules.some((rule) => rule.includes(".claude/agents/")), "agents rule");
  assert.ok(value.rules.some((rule) => rule.includes(".claude/skills/")), "skills rule");
});

test("every call of group() returns a new object", () => {
  const first = group();
  first.skills.push("skills/extra");
  assert.deepEqual(group().skills, ["skills/harness", "skills/evolve"]);
});

// The files member carries the text of each file that the project receives, with project-relative paths inside the group folder .claude/.
test("group() carries files: project-relative paths inside .claude/ with their text", () => {
  const value = group();
  assert.ok(Array.isArray(value.files) && value.files.length > 0, "files is empty");
  for (const file of value.files) {
    assert.deepEqual(Object.keys(file).sort(), ["path", "text"]);
    assert.equal(typeof file.text, "string");
    assert.ok(file.path.startsWith(".claude/"), file.path);
    assert.ok(!file.path.split("/").includes(".."), file.path);
  }
});

test("files hold the SKILL.md of each skill of the group and its reference files", () => {
  const paths = group().files.map((file) => file.path);
  assert.ok(paths.includes(".claude/skills/harness/SKILL.md"), "harness SKILL.md");
  assert.ok(paths.includes(".claude/skills/evolve/SKILL.md"), "evolve SKILL.md");
  assert.ok(paths.includes(".claude/skills/harness/references/team-patterns.md"), "harness reference");
});

// Each agent path must name a file of files.
test("each agent definition path names a file of files", () => {
  const value = group();
  for (const agent of value.agents) {
    assert.ok(value.files.some((file) => file.path === agent.path), agent.path);
  }
});

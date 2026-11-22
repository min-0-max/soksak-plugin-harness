// Checks the group object that maker/group.js returns, with literal expectations, against the group object of the agents.makers interface (agents docs/spec/makers.md).
import assert from "node:assert/strict";
import test from "node:test";
import { group } from "../maker/group.js";

test("maker/group.js exports the function group", () => {
  assert.equal(typeof group, "function");
});

test("group() returns the harness group object with the members of the interface", () => {
  assert.deepEqual(Object.keys(group()).sort(), [
    "agents", "clis", "folders", "id", "name", "path", "plugin", "rules", "skills", "variables",
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
test("the group defines no agent definitions, because the upstream ships none", () => {
  assert.deepEqual(group().agents, []);
});

// The upstream is a Claude Code plugin, so the group runs claude only.
test("the harness group runs claude only", () => {
  assert.deepEqual(group().clis, ["claude"]);
});

test("the harness group sets no variables and prepends no PATH folders", () => {
  assert.deepEqual(group().variables, {});
  assert.deepEqual(group().path, []);
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

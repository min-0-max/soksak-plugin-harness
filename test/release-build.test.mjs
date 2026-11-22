// Checks the pinned upstream release and the build that copies its files into maker/, using a fixture release file of the same layout.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { buildRelease } from "../scripts/build-release.mjs";
import { plugin, skills } from "../maker/layout.js";

const root = new URL("../", import.meta.url);
const pin = JSON.parse(readFileSync(new URL("release/upstream.json", root), "utf8"));
const fixtureSource = new URL("test/fixtures/upstream/", root);

// makeRelease packs the fixture tree into a gzip tar of one top folder, the layout of the codeload release.
function makeRelease(folder, { omit } = {}) {
  const work = mkdtempSync(join(tmpdir(), "harness-fixture-"));
  const top = join(work, "harness-fixture");
  execFileSync("cp", ["-R", join(fixtureSource.pathname, "harness-fixture"), top]);
  if (omit) rmSync(join(top, omit), { recursive: true, force: true });
  const file = join(folder, "release.tar.gz");
  execFileSync("tar", ["-czf", file, "-C", work, "harness-fixture"]);
  rmSync(work, { recursive: true, force: true });
  return file;
}

const sha256 = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");

test("the pin names the revfactory/harness commit and its codeload release", () => {
  assert.equal(pin.repository, "revfactory/harness");
  assert.equal(pin.commit, "92d9f1b29e7af81acebf51a9fcd1832e739a1414");
  assert.equal(pin.url, `https://codeload.github.com/revfactory/harness/tar.gz/${pin.commit}`);
  assert.equal(pin.sha256, "baf67c0596da7b52fe0d9826be1ba4140ee67f19ec57989f90ea0d849dd74754");
});

test("buildRelease copies the group skills, the plugin manifest and the LICENSE into the output folder", async () => {
  const folder = mkdtempSync(join(tmpdir(), "harness-build-"));
  const out = mkdtempSync(join(tmpdir(), "harness-out-"));
  try {
    const releaseFile = makeRelease(folder);
    await buildRelease({ releaseFile, sha256: sha256(releaseFile), out });
    assert.equal(readFileSync(join(out, "skills/harness/SKILL.md"), "utf8"), readFileSync(join(fixtureSource.pathname, "harness-fixture/skills/harness/SKILL.md"), "utf8"));
    assert.equal(readFileSync(join(out, "skills/evolve/SKILL.md"), "utf8"), readFileSync(join(fixtureSource.pathname, "harness-fixture/skills/evolve/SKILL.md"), "utf8"));
    assert.equal(readFileSync(join(out, "plugin/.claude-plugin/plugin.json"), "utf8"), readFileSync(join(fixtureSource.pathname, "harness-fixture/.claude-plugin/plugin.json"), "utf8"));
    assert.equal(readFileSync(join(out, "LICENSE"), "utf8"), readFileSync(join(fixtureSource.pathname, "harness-fixture/LICENSE"), "utf8"));
  } finally {
    rmSync(folder, { recursive: true, force: true });
    rmSync(out, { recursive: true, force: true });
  }
});

test("buildRelease writes files.js with the project-relative text of each skill file", async () => {
  const folder = mkdtempSync(join(tmpdir(), "harness-build-"));
  const out = mkdtempSync(join(tmpdir(), "harness-out-"));
  try {
    const releaseFile = makeRelease(folder);
    await buildRelease({ releaseFile, sha256: sha256(releaseFile), out });
    const { files } = await import(pathToFileURL(join(out, "files.js")).href);
    const text = (path) => readFileSync(join(fixtureSource.pathname, "harness-fixture", path), "utf8");
    assert.deepEqual(
      files.map((file) => file.path).sort(),
      [
        ".claude/skills/evolve/SKILL.md",
        ".claude/skills/harness/SKILL.md",
        ".claude/skills/harness/references/note.md",
      ],
    );
    const byPath = Object.fromEntries(files.map((file) => [file.path, file.text]));
    assert.equal(byPath[".claude/skills/harness/SKILL.md"], text("skills/harness/SKILL.md"));
    assert.equal(byPath[".claude/skills/harness/references/note.md"], text("skills/harness/references/note.md"));
    assert.equal(byPath[".claude/skills/evolve/SKILL.md"], text("skills/evolve/SKILL.md"));
  } finally {
    rmSync(folder, { recursive: true, force: true });
    rmSync(out, { recursive: true, force: true });
  }
});

test("buildRelease copies no skill folder that the group does not name", async () => {
  const folder = mkdtempSync(join(tmpdir(), "harness-build-"));
  const out = mkdtempSync(join(tmpdir(), "harness-out-"));
  try {
    const releaseFile = makeRelease(folder);
    await buildRelease({ releaseFile, sha256: sha256(releaseFile), out });
    assert.equal(existsSync(join(out, "skills/unlisted")), false);
  } finally {
    rmSync(folder, { recursive: true, force: true });
    rmSync(out, { recursive: true, force: true });
  }
});

// Every path that maker/layout.js names must exist after the build, so the agents plugin never reads a missing folder.
test("every path that maker/layout.js names exists in the built output", async () => {
  const folder = mkdtempSync(join(tmpdir(), "harness-build-"));
  const out = mkdtempSync(join(tmpdir(), "harness-out-"));
  try {
    const releaseFile = makeRelease(folder);
    await buildRelease({ releaseFile, sha256: sha256(releaseFile), out });
    for (const path of [plugin, ...skills]) {
      assert.ok(existsSync(join(out, path)), `${path} is missing from the output`);
    }
  } finally {
    rmSync(folder, { recursive: true, force: true });
    rmSync(out, { recursive: true, force: true });
  }
});

test("buildRelease refuses a release file whose sha256 differs from the pin", async () => {
  const folder = mkdtempSync(join(tmpdir(), "harness-build-"));
  const out = mkdtempSync(join(tmpdir(), "harness-out-"));
  try {
    const releaseFile = makeRelease(folder);
    const digest = sha256(releaseFile);
    await assert.rejects(
      () => buildRelease({ releaseFile, sha256: "0".repeat(64), out }),
      new RegExp(`release file sha256 ${digest} does not match the pinned ${"0".repeat(64)}`),
    );
    assert.equal(existsSync(join(out, "skills")), false, "no file is written before the pin matches");
  } finally {
    rmSync(folder, { recursive: true, force: true });
    rmSync(out, { recursive: true, force: true });
  }
});

test("buildRelease names the skill folder that the release lacks", async () => {
  const folder = mkdtempSync(join(tmpdir(), "harness-build-"));
  const out = mkdtempSync(join(tmpdir(), "harness-out-"));
  try {
    const releaseFile = makeRelease(folder, { omit: "skills/evolve" });
    await assert.rejects(
      () => buildRelease({ releaseFile, sha256: sha256(releaseFile), out }),
      /skills\/evolve/,
    );
  } finally {
    rmSync(folder, { recursive: true, force: true });
    rmSync(out, { recursive: true, force: true });
  }
});

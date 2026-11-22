#!/usr/bin/env node
// Builds the release folder maker/ of the harness plugin from the upstream release pinned in release/upstream.json:
//   maker/skills/<name>/                    the skill folders that maker/layout.js names, copied unchanged (each holds a SKILL.md)
//   maker/plugin/.claude-plugin/plugin.json the upstream plugin manifest, copied unchanged
//   maker/LICENSE                           the upstream LICENSE (Apache-2.0), and maker/NOTICE when the release holds one
//   maker/files.js                          the files of the group's skills as {path, text}, with project-relative paths under .claude/skills/
//   maker/harness.js                        maker/group.js bundled with files.js and layout.js into one ES module without imports, the module
//                                           that plugin.json contributes, because core grants the agents page only that one file
// The release file must equal its sha256 pin before anything is extracted or written. The build reads no other network address
// except the pinned url when no --release-file is given. The build changes no upstream file: the upstream skills need no correction,
// because their paths (.claude/agents/, .claude/skills/, CLAUDE.md) are the locations that maker/layout.js declares in folders.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { folders, plugin, skills } from "../maker/layout.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// listFiles returns the files under folder as paths relative to it, with a slash between the parts.
function listFiles(folder, prefix = "") {
  return readdirSync(join(folder, prefix), { withFileTypes: true }).flatMap((entry) => {
    const path = prefix === "" ? entry.name : `${prefix}/${entry.name}`;
    return entry.isDirectory() ? listFiles(folder, path) : [path];
  });
}

// buildRelease writes the group's files under out from the release file, after the release file matches the sha256 pin.
export async function buildRelease({ releaseFile, sha256, out }) {
  const digest = createHash("sha256").update(readFileSync(releaseFile)).digest("hex");
  if (digest !== sha256) throw new Error(`release file sha256 ${digest} does not match the pinned ${sha256}: ${releaseFile}`);

  const work = mkdtempSync(join(tmpdir(), "harness-release-"));
  try {
    execFileSync("tar", ["-xzf", releaseFile, "-C", work]);
    const top = readdirSync(work);
    if (top.length !== 1) throw new Error(`release file must hold one top folder, found: ${top.join(", ")}: ${releaseFile}`);
    const source = join(work, top[0]);

    // skills: each folder that maker/layout.js names must hold a SKILL.md in the release.
    for (const skill of skills) {
      if (!existsSync(join(source, skill, "SKILL.md"))) throw new Error(`release lacks ${skill}/SKILL.md: ${releaseFile}`);
      rmSync(join(out, skill), { recursive: true, force: true });
      mkdirSync(join(out, skill, ".."), { recursive: true });
      cpSync(join(source, skill), join(out, skill), { recursive: true });
    }

    // files: the text of every file of the group's skills, at the project path under .claude/skills/<name>/. Each file must be UTF-8
    // text, because the text is written into files.js as a string; the project paths must lie inside the group's folders.
    const files = [];
    for (const skill of skills) {
      const name = basename(skill);
      for (const relative of listFiles(join(source, skill)).sort()) {
        const raw = readFileSync(join(source, skill, relative));
        const text = raw.toString("utf8");
        if (!Buffer.from(text, "utf8").equals(raw)) throw new Error(`${skill}/${relative} is not UTF-8 text: ${releaseFile}`);
        const path = `.claude/skills/${name}/${relative}`;
        if (!folders.some((folder) => path.startsWith(folder))) throw new Error(`${path} lies outside the group folders: ${folders.join(", ")}`);
        files.push({ path, text });
      }
    }
    writeFileSync(join(out, "files.js"), `export const files = ${JSON.stringify(files, null, 2)};\n`);

    // module: the contributed module, maker/group.js with the files.js of out and layout.js inlined. Core grants the agents page only
    // the contributed file of this plugin, so the module imports nothing.
    await build({
      entryPoints: [join(ROOT, "maker", "group.js")],
      outfile: join(out, "harness.js"),
      bundle: true,
      format: "esm",
      charset: "utf8",
      logLevel: "error",
      plugins: [{
        name: "built-files",
        setup(resolver) {
          resolver.onResolve({ filter: /^\.\/files\.js$/ }, () => ({ path: join(out, "files.js") }));
        },
      }],
    });

    // plugin: the upstream plugin manifest, which the agent CLI reads from the plugin folder that maker/layout.js names.
    const manifest = join(source, ".claude-plugin", "plugin.json");
    if (!existsSync(manifest)) throw new Error(`release lacks .claude-plugin/plugin.json: ${releaseFile}`);
    rmSync(join(out, plugin), { recursive: true, force: true });
    mkdirSync(join(out, plugin, ".claude-plugin"), { recursive: true });
    copyFileSync(manifest, join(out, plugin, ".claude-plugin", "plugin.json"));

    // license: the upstream is Apache-2.0, so the redistributed files carry its LICENSE, and its NOTICE when the release holds one.
    const license = join(source, "LICENSE");
    if (!existsSync(license)) throw new Error(`release lacks LICENSE: ${releaseFile}`);
    copyFileSync(license, join(out, "LICENSE"));
    const notice = join(source, "NOTICE");
    rmSync(join(out, "NOTICE"), { force: true });
    if (existsSync(notice)) copyFileSync(notice, join(out, "NOTICE"));
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

async function main(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (!argv[i].startsWith("--") || argv[i + 1] === undefined) throw new Error("usage: build-release.mjs [--release-file <file>] [--out <folder>]");
    args[argv[i].slice(2)] = argv[i + 1];
  }
  const pin = JSON.parse(readFileSync(join(ROOT, "release", "upstream.json"), "utf8"));
  let releaseFile = args["release-file"];
  if (!releaseFile) {
    const response = await fetch(pin.url);
    if (!response.ok) throw new Error(`fetch ${pin.url}: HTTP ${response.status}`);
    const folder = mkdtempSync(join(tmpdir(), "harness-release-file-"));
    releaseFile = join(folder, basename(pin.url));
    writeFileSync(releaseFile, Buffer.from(await response.arrayBuffer()));
  }
  await buildRelease({ releaseFile, sha256: pin.sha256, out: args.out ?? join(ROOT, "maker") });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

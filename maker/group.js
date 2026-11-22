// The harness group of the agents.makers interface (agents docs/spec/makers.md).
// The paths are relative to this folder (maker/). The build writes skills/, plugin/, LICENSE and files.js here from the upstream
// release pinned in release/upstream.json (scripts/build-release.mjs); the build changes no upstream file.
import { files } from "./files.js";
import { folders, plugin, skills } from "./layout.js";

// group returns the group object. The upstream harness is a Claude Code plugin whose skills are the two folders below.
export function group() {
  return {
    id: "harness",
    name: "하네스",
    plugin,
    // The upstream plugin is a Claude Code plugin, so the group runs claude only.
    clis: ["claude"],
    // The upstream ships no agent definition file; its skills create the agent definitions in the project at run time.
    agents: [],
    skills: [...skills],
    variables: {},
    path: [],
    folders: [...folders],
    rules: [
      "Write agent definitions to .claude/agents/ and skills to .claude/skills/ of the project.",
    ],
    // The files of the group with the text the project receives: project-relative paths inside folders, generated from the pinned skills.
    files: files.map((file) => ({ ...file })),
  };
}

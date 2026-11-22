// The harness group of the agents.makers interface (agents docs/spec/makers.md).
// The paths are relative to this folder (maker/). The build writes skills/, plugin/ and LICENSE here from the upstream release
// pinned in release/upstream.json (scripts/build-release.mjs); the build changes no upstream file.

// group returns the group object. The upstream harness is a Claude Code plugin whose skills are the two folders below.
export function group() {
  return {
    id: "harness",
    name: "하네스",
    // The plugin folder that the agent CLI loads with its plugin directory option: the upstream plugin manifest only.
    plugin: "plugin",
    // The upstream plugin is a Claude Code plugin, so the group runs claude only.
    clis: ["claude"],
    // The upstream ships no agent definition file; its skills create the agent definitions in the project at run time.
    agents: [],
    // The skill folders of the upstream plugin, one folder per skill, each holding a SKILL.md.
    skills: ["skills/harness", "skills/evolve"],
    variables: {},
    path: [],
    // The upstream skills write agent definitions to .claude/agents/, skills to .claude/skills/ and CLAUDE.md in the project.
    folders: [".claude/"],
    rules: [
      "Write agent definitions to .claude/agents/ and skills to .claude/skills/ of the project.",
    ],
  };
}

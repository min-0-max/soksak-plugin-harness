// The paths and folders of the harness group, read by maker/group.js and by scripts/build-release.mjs. They are relative to
// maker/ (the paths) or to the project (the folders), as the agents makers contract states them.

// The plugin folder that the agent CLI loads with its plugin directory option: the upstream plugin manifest only.
export const plugin = "plugin";

// The skill folders of the upstream plugin, one folder per skill, each holding a SKILL.md.
export const skills = ["skills/harness", "skills/evolve"];

// The upstream skills write agent definitions to .claude/agents/, skills to .claude/skills/ and CLAUDE.md in the project.
export const folders = [".claude/"];

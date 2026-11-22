// The maker group that this plugin contributes to the extension point agents.makers of the agents plugin
// (core docs/spec/plugins.md#extension-points). The agents plugin reads this export; the other fields of the group
// (the corrected plugin folder, agent definitions, skills and run variables) are added by the install-time correction.
export const group = Object.freeze({
  id: "harness",
  name: "하네스",
  projectFolder: ".harness",
});

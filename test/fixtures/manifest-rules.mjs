// The declaration rules that this plugin applies to its plugin.json, as core docs/spec/plugins.md states them.
// validateManifest returns the list of refusals; an empty list accepts the manifest.
import path from "node:path";

// The members that core docs/spec/plugins.md#pluginjson lists; any other member is an unknown member.
export const MEMBERS = [
  "id", "name", "description", "surface", "sections", "sidebars", "preview", "dependencies",
  "events", "extends", "contributes", "data", "sessions", "background",
];

// The members that this plugin does not declare: it has no surface, no sections and no stored data.
const FORBIDDEN = ["surface", "sections", "sidebars", "preview", "data", "sessions", "background", "events", "extends"];

const PLUGIN_ID = /^[a-z][a-z0-9-]*$/;
const VERSION_RANGE = /^[\^~>=<0-9. ]+$/;

// A module path is relative to the plugin folder, has no empty, "." or ".." segment, and ends in .js.
function moduleProblem(module) {
  if (typeof module !== "string" || module === "") return "module must be a non-empty string";
  if (path.posix.isAbsolute(module) || module.startsWith("/")) return `module ${module} must be relative`;
  if (module.split("/").some((segment) => segment === "" || segment === "." || segment === "..")) return `module ${module} has an empty, "." or ".." segment`;
  if (!module.endsWith(".js")) return `module ${module} must end in .js`;
  return null;
}

// `exists(relativePath)` tells whether a file of the plugin folder exists.
export function validateManifest(manifest, { exists = () => true } = {}) {
  const errors = [];
  if (manifest === null || typeof manifest !== "object" || Array.isArray(manifest)) return ["manifest must be an object"];

  for (const key of Object.keys(manifest)) {
    if (!MEMBERS.includes(key)) errors.push(`unknown member ${key}`);
  }
  for (const key of FORBIDDEN) {
    if (key in manifest) errors.push(`this plugin must not declare ${key}`);
  }
  if (!("surface" in manifest) && !("sections" in manifest) && !("contributes" in manifest)) {
    errors.push("a plugin requires surface, sections or contributes");
  }

  if (typeof manifest.id !== "string" || !PLUGIN_ID.test(manifest.id) || manifest.id === "core") {
    errors.push(`id ${JSON.stringify(manifest.id)} must match [a-z][a-z0-9-]* and must not be core`);
  }
  if (typeof manifest.name !== "string" || manifest.name === "") errors.push("name must be a non-empty string");
  if (typeof manifest.description !== "string" || manifest.description.length < 1 || manifest.description.length > 200) {
    errors.push("description must be 1 to 200 characters");
  }

  const dependencies = manifest.dependencies ?? {};
  for (const [name, range] of Object.entries(dependencies)) {
    if (typeof range !== "string" || !VERSION_RANGE.test(range)) errors.push(`dependency ${name} has an invalid range ${JSON.stringify(range)}`);
  }

  for (const [point, items] of Object.entries(manifest.contributes ?? {})) {
    const dot = point.indexOf(".");
    const providerId = dot === -1 ? "" : point.slice(0, dot);
    if (!PLUGIN_ID.test(providerId) || point.slice(dot + 1) === "") {
      errors.push(`contributes point ${point} must be <plugin id>.<point>`);
      continue;
    }
    if (!(`@soksak/plugin-${providerId}` in dependencies)) {
      errors.push(`contributes ${point} requires the dependency @soksak/plugin-${providerId}`);
    }
    if (!Array.isArray(items) || items.length === 0) {
      errors.push(`contributes ${point} must be a non-empty array`);
      continue;
    }
    for (const item of items) {
      if (typeof item.range !== "string" || !VERSION_RANGE.test(item.range)) {
        errors.push(`contributes ${point} has an invalid range ${JSON.stringify(item.range)}`);
      }
      const problem = moduleProblem(item.module);
      if (problem) errors.push(`contributes ${point}: ${problem}`);
      else if (!exists(item.module)) errors.push(`contributes ${point}: module ${item.module} does not exist`);
    }
  }
  return errors;
}

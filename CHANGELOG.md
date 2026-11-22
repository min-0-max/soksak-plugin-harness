# Changelog

[한국어](CHANGELOG.ko.md)

- H1: The plugin declares `plugin.json` with the dependency `@soksak/plugin-agents` and the contribution of the group `harness` to `agents.makers` through `maker/group.js`. The package has no surface and no sections. The tests `test/manifest.test.mjs` and `test/manifest-rules.test.mjs` pass 9 tests with `make test`. The version in `package.json` stays `0.0.0` until the first release.
- H2: The group `harness` carries the required string fields `id` and `name` of the `agents.makers` item schema, and the contribution range contains the point version of `agents.makers`. The tests in `test/manifest.test.mjs` check both, and `make test` passes 11 tests.
- H4: `maker/group.js` exports the function `group()`, which returns the group object of the agents `makers` contract with the upstream harness values: the skills `skills/harness` and `skills/evolve`, the claude CLI, no agent definitions, and the folder `.claude/`, where the upstream skills write their files. The tests in `test/group-shape.test.mjs` check each member, and `make test` passes 21 tests.
- H5: The contribution range of `agents.makers` is `^0.0.1`, which contains the point version 0.0.1. The agents plugin corrected the point version from 0.1.0, because versions stay 0.0.

# Changelog

[한국어](CHANGELOG.ko.md)

- H1: The plugin declares `plugin.json` with the dependency `@soksak/plugin-agents` and the contribution of the group `harness` to `agents.makers` through `maker/group.js`. The package has no surface and no sections. The tests `test/manifest.test.mjs` and `test/manifest-rules.test.mjs` pass 9 tests with `make test`. The version in `package.json` stays `0.0.0` until the first release.
- H2: The group `harness` carries the required string fields `id` and `name` of the `agents.makers` item schema, and the contribution range is `^0.1.0`, which contains the point version 0.1.0. The tests in `test/manifest.test.mjs` check both, and `make test` passes 11 tests.

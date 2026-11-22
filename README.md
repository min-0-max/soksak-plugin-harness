# Harness plugin

[한국어](README.ko.md)

Harness plugin: the maker group `harness` of the agents plugin. It has no surface. The plugin format is defined in the soksak core specification (`docs/spec/plugins.md`).

```sh
make install                                # once: install the locked dependencies
make test                                   # tests of this plugin
make check                                  # record check and command name check of the pinned kit release
make pack OUT=<folder>                      # the plugin release
make install-hooks                          # once after cloning: check commit messages and records at commit time
```

The checklist is [docs/features.md](docs/features.md).

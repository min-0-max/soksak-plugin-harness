.PHONY: install test build check pack check-push install-hooks

# The installation stage (core docs/spec/plugins.md#repositories): it installs the locked dependencies. The tests, checks and packs
# consume what it installed without installing.
install:
	pnpm install --frozen-lockfile

# test builds maker/ first, because maker/group.js imports the generated maker/files.js.
test: build
	pnpm test

# check runs the record check and the command name check of the kit release that package.json pins.
check:
	pnpm exec sok-check docs
	pnpm exec sok-check commands

# build writes maker/skills, maker/plugin and maker/LICENSE from the release pinned in release/upstream.json (it fetches the release file when no release file is given).
build:
	pnpm run release

pack: check build
	@test -n "$(OUT)" || { echo "make pack OUT=<folder>" >&2; exit 2; }
	pnpm pack --pack-destination $(OUT)

# The checks that a push needs: the commit messages and the checklist history of the pushed range. RANGE is set by the pre-push hook.
check-push:
	pnpm exec sok-check commits "$(or $(RANGE),origin/main..HEAD)"
	pnpm exec sok-check docs --range "$(or $(RANGE),origin/main..HEAD)"

# Sets this repository to use .githooks, which checks commit messages and records at commit time.
install-hooks:
	@git config core.hooksPath .githooks

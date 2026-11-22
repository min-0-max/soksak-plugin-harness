# 변경 기록

[English](CHANGELOG.md)

- H8: `agents.makers` item이 `id`와 `name`을 가져서 core가 연결하고 agents가 harness group을 보여 준다. version은 0.0.2이다.
- H7: `plugin.json`이 agents plugin `>=0.0.1`을 요구해서 agents 0.0.2 이후 version과 함께 설치된다. version은 0.0.1이다.
- H3: Workflow `ci.yml`과 `release.yml`이 push마다 검사하고 `make pack`으로 release한다.
- H1: plugin은 `plugin.json`에 dependency `@soksak/plugin-agents`를 선언하고, module `maker/group.js`로 group `harness`를 `agents.makers`에 기여한다. package에는 surface와 sections가 없다. 시험 `test/manifest.test.mjs`와 `test/manifest-rules.test.mjs`가 `make test`에서 9개 시험을 통과한다. `package.json`의 version은 첫 release까지 `0.0.0`이다.
- H2: group `harness`는 `agents.makers` item schema가 요구하는 문자열 필드 `id`와 `name`을 가지며, 기여 range는 `agents.makers`의 point version을 포함한다. 시험 `test/manifest.test.mjs`가 둘을 확인하고, `make test`가 11개 시험을 통과한다.
- H4: `maker/group.js`는 함수 `group()`을 export하며, 이 함수는 upstream harness 값으로 `agents.makers` 계약의 group object를 반환한다. 값은 스킬 `skills/harness`와 `skills/evolve`, claude CLI, agent 정의 없음, upstream 스킬이 파일을 쓰는 폴더 `.claude/`다. 시험 `test/group-shape.test.mjs`가 member를 각각 확인한다.
- H4: `make build`는 고정한 upstream release를 가져와 sha256을 확인하고, `maker/skills`, `maker/plugin`, `maker/LICENSE`, `maker/files.js`(스킬 파일을 `{path, text}`로 담은 파일)를 쓴다. `group()`은 `maker/files.js`에서 member `files`를 반환하고, module과 build가 함께 쓰는 경로는 `maker/layout.js`에 있다. 시험 `test/release-build.test.mjs`와 `test/group-shape.test.mjs`가 `make test`에서 31개 시험을 통과한다.
- H6: group에 agent `harness`(`cli` `claude`) 하나가 있으며, 그 `path`는 `files`의 경로 중 하나인 harness 스킬 파일 `.claude/skills/harness/SKILL.md`다. 시험 `test/group-shape.test.mjs`가 이를 확인하고, `make test`가 31개 시험을 통과한다.
- H5: `agents.makers`의 기여 range는 point version 0.0.1을 포함하는 `^0.0.1`이다. agents plugin은 point version 0.1.0을 0.0.1로 고쳤다. version은 0.0을 유지하기 때문이다.

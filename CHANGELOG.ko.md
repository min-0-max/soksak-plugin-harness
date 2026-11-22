# 변경 기록

[English](CHANGELOG.md)

- H1: plugin은 `plugin.json`에 dependency `@soksak/plugin-agents`를 선언하고, module `maker/group.js`로 group `harness`를 `agents.makers`에 기여한다. package에는 surface와 sections가 없다. 시험 `test/manifest.test.mjs`와 `test/manifest-rules.test.mjs`가 `make test`에서 9개 시험을 통과한다. `package.json`의 version은 첫 release까지 `0.0.0`이다.
- H2: group `harness`는 `agents.makers` item schema가 요구하는 문자열 필드 `id`와 `name`을 가지며, 기여 range는 `agents.makers`의 point version을 포함한다. 시험 `test/manifest.test.mjs`가 둘을 확인하고, `make test`가 11개 시험을 통과한다.
- H4: `maker/group.js`는 함수 `group()`을 export하며, 이 함수는 upstream harness 값으로 `agents.makers` 계약의 group object를 반환한다. 값은 스킬 `skills/harness`와 `skills/evolve`, claude CLI, agent 정의 없음, upstream 스킬이 파일을 쓰는 폴더 `.claude/`다. 시험 `test/group-shape.test.mjs`가 member를 각각 확인하고, `make test`가 21개 시험을 통과한다.
- H5: `agents.makers`의 기여 range는 point version 0.0.1을 포함하는 `^0.0.1`이다. agents plugin은 point version 0.1.0을 0.0.1로 고쳤다. version은 0.0을 유지하기 때문이다.

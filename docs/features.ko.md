# 기능

- [o] H1 — P1: plugin이 manifest를 선언하고 `agents.makers`에 harness group을 기여한다. 입력: 저장소에 manifest가 없었다. 기대: `plugin.json`은 surface와 sections를 선언하지 않고, `dependencies`에 `@soksak/plugin-agents`를 두며, `agents.makers`에 module `maker/group.js`를 기여한다. 이 module은 group `id` `harness`와 프로젝트 폴더 `.harness`를 export한다. `test/manifest-rules.test.mjs`는 잘못된 manifest를 각각 이유와 함께 거부한다. 결과: `make test`가 9개 시험을 통과한다.
- [ ] H2 — P1: 설치할 때 harness plugin 폴더(`--plugin-dir`), agent 정의, 스킬, 실행 변수를 교정해서 group에 넣는다. 대기 조건: agents plugin의 `agents.makers` interface가 `id`와 `projectFolder` 밖의 group 필드를 정하고, 메이커 plugin의 installer가 있어야 한다(agent-workspace plan, 메이커 plugin).
- [ ] H3 — P2: CI와 release workflow가 `make install`, `make test`, `make check`를 실행하고, `make pack`이 release를 쓴다. 대기 조건: agents plugin의 첫 release다. `dependencies`의 `@soksak/plugin-agents`를 registry에서 설치할 수 없고, 이 plugin의 version도 그 release와 함께 정한다.

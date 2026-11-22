# Harness plugin

[English](README.md)

Harness plugin: agents plugin의 메이커 group `harness`입니다. surface는 없어요. plugin 형식은 soksak core 명세(`docs/spec/plugins.md`)에 정의되어 있어요.

```sh
make install                                # 한 번: 고정된 의존성을 설치해요
make test                                   # 이 plugin의 시험
make check                                  # 고정된 kit release의 기록 검사와 명령 이름 검사
make pack OUT=<folder>                      # plugin release
make install-hooks                          # clone 한 뒤 한 번: commit 메시지와 기록을 commit 때 검사해요
```

체크리스트는 [docs/features.ko.md](docs/features.ko.md)입니다.

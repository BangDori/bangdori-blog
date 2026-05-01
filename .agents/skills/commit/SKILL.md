---
name: commit
description: 변경 사항을 커밋한다. "/commit", "커밋해줘", "커밋" 같은 발화에 트리거. staged 파일이 없으면 전체 add 후 커밋. 메시지는 Conventional Commits 컨벤션을 따른다.
---

## 절차

1. `git status --short`로 현재 상태 확인
2. staged 파일이 없으면 `git add -A`
3. diff를 보고 Conventional Commits 형식 커밋 메시지 작성
   - prefix: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `style:`, `test:`
   - 한국어/영어는 변경 내용에 맞게 자연스러운 쪽 선택
   - scope는 선택: `feat(user-web):` 등
4. 메시지를 사용자에게 보여주고 확인 받기
5. 확인 받으면 `git commit -m "메시지"`

## 변경 사항이 많을 때

변경 파일이 여러 관심사에 걸쳐 있으면 논리적 단위로 나눠서 커밋한다.

1. `git diff --stat`으로 변경 파일 목록 확인
2. 관심사별로 그룹핑 (예: 설정 파일 vs 기능 코드 vs 문서)
3. 그룹마다 `git add <파일들>` → `git commit -m "메시지"` 반복
4. 분할 기준이 애매하면 사용자에게 후보를 보여주고 확인 받기

단, 모든 변경이 하나의 맥락이면 굳이 나누지 않는다.

## 주의

- `--no-verify` 사용하지 않음
- 커밋 전에 반드시 사용자 확인

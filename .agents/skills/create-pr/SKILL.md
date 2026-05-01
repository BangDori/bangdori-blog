---
name: create-pr
description: GitHub PR을 생성한다. "/create-pr", "PR 만들어줘", "PR 올려줘" 같은 발화에 트리거. 현재 브랜치의 변경 사항을 기반으로 PR을 생성한다.
---

## 절차

1. 커밋되지 않은 변경이 있으면 먼저 `/skill:commit`을 안내
2. `git log develop..HEAD --oneline`으로 이 브랜치의 커밋 목록 확인
3. PR 제목과 본문 초안 작성:
   - **제목**: Conventional Commits prefix + 핵심 변경 요약
   - **본문**: `.github/PULL_REQUEST_TEMPLATE.md` 템플릿에 맞춰 작성 (요약 → 변경 내용 → 검증 → 참고)
4. 초안을 사용자에게 보여주고 확인/수정 받기
5. 확인 받으면 push + PR 생성:

```bash
git push origin HEAD
gh-auto pr create --base develop --title "제목" --body "본문"
```

## 주의

- base branch는 `develop` (다른 base가 필요하면 사용자에게 확인)
- push 전에 반드시 사용자 확인
- `gh-auto`를 사용 (계정 자동 전환)

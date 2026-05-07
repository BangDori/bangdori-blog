---
name: respond-review
description: PR에 달린 리뷰 코멘트를 읽고, 코드 수정 후 커밋 SHA를 포함한 답글을 달아야 할 때 사용
---

# Respond to PR Review

PR에 달린 리뷰 코멘트를 분석하여 코드를 수정하고, 커밋 SHA가 포함된 답글을 남깁니다.

## 워크플로우

### Phase 1: 리뷰 코멘트 수집

1. **PR 식별**: `$ARGUMENTS`가 있으면 해당 PR, 없으면 현재 브랜치의 PR 사용 → [cheatsheet §1](references/api-cheatsheet.md) 참조
2. **미해결 리뷰 스레드 조회**: GraphQL로 `isResolved: false`인 스레드만 수집 → [cheatsheet §2](references/api-cheatsheet.md) 참조
3. **필터링**: `isResolved: false`인 스레드만 대상. `isOutdated: true`도 포함 (코드가 변경되어 outdated 되었을 수 있음)

### Phase 2: 분류 및 계획

리뷰 코멘트를 다음 카테고리로 분류합니다:

| 카테고리 | 설명 | 대응 방식 |
|---------|------|----------|
| **코드 수정** | 버그, 개선, 리팩토링 요청 | 코드 변경 + 커밋 |
| **질문/설명 요청** | 코드 의도, 설계 이유 질문 | 답글만 (코드 변경 없음) |
| **논의 필요** | 트레이드오프, 설계 결정 관련 | AskUserQuestion으로 방향 확인 |

**분류 후 AskUserQuestion (필수)**:

모든 리뷰 코멘트에 대해 에이전트의 검토 의견과 대응 계획을 사용자에게 **반드시** AskUserQuestion으로 확인합니다. 항목 수나 명확성에 관계없이 **생략 불가**합니다.

```
리뷰 코멘트를 검토했습니다:

1. ✏️ [path:line] 리뷰 요약
   → 에이전트 검토: {타당/부정확/판단 어려움} — {근거}
   → 제안: {수정 계획 또는 현행 유지 사유}
2. 💬 [path:line] 질문 내용
   → 제안: {답변 초안}
3. ⚠️ [path:line] 논의 필요
   → 에이전트 검토: {선택지와 트레이드오프}

어떻게 대응할까요?
```

### Phase 3: 코드 수정 및 커밋

리뷰 코멘트별로 **개별 커밋**합니다 (반영률 추적을 위해):

1. 해당 파일의 관련 코드 읽기
2. 리뷰 요청에 맞게 코드 수정
3. 커밋 메시지 형식: `fix: 리뷰 반영 — {변경 요약}` (타입은 변경 성격에 따라 `fix`, `refactor`, `enhance` 등 적절히 선택)
4. **커밋 SHA 기록**: 각 커밋의 short SHA를 기록 → [cheatsheet §6](references/api-cheatsheet.md) 참조

> **주의**: 여러 리뷰가 같은 파일의 밀접한 영역을 다루면 하나의 커밋으로 합칠 수 있음

### Phase 4: Push

코드 수정 커밋을 모두 마친 뒤 `git push`합니다. 답글에 커밋 SHA 링크가 걸리려면 remote에 push가 선행되어야 합니다.

### Phase 5: 리뷰 스레드에 답글

각 리뷰 스레드에 커밋 SHA가 포함된 답글을 남깁니다.

**답글 형식 (코드 수정)**:
```
반영 완료 (`{SHORT_SHA}`):

- {변경 내용 1}
- {변경 내용 2}
```

**답글 형식 (현행 유지)**:
```
{유지 사유 설명}
```

**답글 형식 (질문/설명)**:
```
{답변 내용}
```

**답글 작성 API**: [cheatsheet §3](references/api-cheatsheet.md) 참조 (`comment_id`는 스레드 **첫 번째 코멘트**의 `databaseId`)

### Phase 6: 스레드 Resolve

**스레드 resolve는 하지 않는다.** 리뷰어가 직접 확인 후 resolve하는 것이 원칙이므로, 에이전트는 답글만 남기고 resolve API를 호출하지 않는다.

## 에이전트 규칙

1. **답글에 반드시 커밋 SHA 포함**: 코드 수정 시 short SHA (`%h`)를 백틱으로 감싸서 포함. 이것이 리뷰 반영률 측정의 핵심 지표
2. **개별 커밋 선호**: 리뷰 코멘트별로 별도 커밋하여 추적 용이하게 함 (밀접한 리뷰는 합칠 수 있음)
3. **모든 리뷰에 대해 AskUserQuestion 필수**: 리뷰 코멘트를 무조건 반영하지 않는다. 에이전트가 먼저 실제 코드를 읽고 지적의 타당성을 자체 판단한 뒤, 검토 의견과 제안을 **반드시 AskUserQuestion으로 사용자에게 보고**하고 승인을 받은 후에만 코드를 수정한다
   - AI 리뷰어(CodeRabbit 등)는 환각이 있을 수 있음 — 심각도와 관계없이 맹목적으로 따르지 않음
   - 판단이 어려운 경우 → 선택지와 트레이드오프를 정리하여 사용자가 결정하도록 함
4. **`gh-auto` 사용**: GitHub API 호출 시 반드시 `gh-auto`를 사용하여 계정 자동 전환

## 참조

- API 치트시트: [references/api-cheatsheet.md](references/api-cheatsheet.md)
- 커밋 컨벤션: [../commit/SKILL.md](../commit/SKILL.md)


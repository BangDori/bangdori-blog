# GitHub API Cheatsheet — PR Review Response

> `gh-auto`를 사용하여 계정 자동 전환 (BangDori 개인 계정)

## 1. 현재 브랜치의 PR 번호 확인

```bash
gh-auto pr view --json number -q '.number'
```

## 2. 미해결 리뷰 스레드 조회 (GraphQL)

```bash
gh-auto api graphql -f query='
query($owner: String!, $repo: String!, $pr: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $pr) {
      reviewThreads(first: 100) {
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          startLine
          comments(first: 10) {
            nodes {
              id
              databaseId
              body
              path
              line
              startLine
              author { login }
              createdAt
            }
          }
        }
      }
    }
  }
}' -f owner=BangDori -f repo=bangdori-blog -F pr=NUMBER
```

**필터링**: `jq`로 미해결 스레드만 추출
```bash
--jq '.data.repository.pullRequest.reviewThreads.nodes | map(select(.isResolved == false))'
```

## 3. 리뷰 코멘트에 답글 달기 (REST)

```bash
gh-auto api repos/{owner}/{repo}/pulls/{PR_NUMBER}/comments/{COMMENT_ID}/replies \
  --method POST \
  -f body='반영 완료 (`abc1234`):

- 변경 내용 설명'
```

- `COMMENT_ID`: 스레드 첫 번째 코멘트의 `databaseId`
- body에 short SHA를 **반드시** 포함

## 4. 리뷰 스레드 Resolve (GraphQL)

```bash
gh-auto api graphql -f query='
mutation($threadId: ID!) {
  resolveReviewThread(input: { threadId: $threadId }) {
    thread { isResolved }
  }
}' -f threadId='PRT_XXXXXXXXX'
```

- `threadId`: 스레드의 GraphQL node `id` (PRT_ 접두사)

## 5. 리뷰어 확인 및 Re-request Review

```bash
# 리뷰어 확인
gh-auto pr view NUMBER --json latestReviews --jq '.latestReviews[].author.login'

# re-request review
gh-auto pr edit NUMBER --add-reviewer REVIEWER_LOGIN
```

## 6. 커밋 SHA 조회

```bash
# 마지막 커밋의 short SHA
git log -1 --format='%h'

# 마지막 N개 커밋의 SHA + 메시지
git log -N --format='%h %s'
```

## 7. 리뷰 뱃지 파싱

AI 리뷰 코멘트에는 Severity 뱃지가 포함���:
```
_⚠️ Potential issue_ | _🟠 Major_
_🧹 Nitpick_ | _🟡 Minor_
```

CodeRabbit은 이모지 + 텍스트 형식을 사용. 본문 첫 줄에서 severity 파싱.

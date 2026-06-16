# User External Posts API

## 목적

`GET /user/external-posts` 는 user-web 이 Medium, GitHub, Velog 같은 외부 플랫폼에 발행된 글 링크를 읽기 위한 public read API 다.

이번 단계에서는 user-web 목록 병합에 필요한 최소 메타데이터만 제공한다. 내부 글(`posts`)과 외부 글(`external_posts`)을 user-web UI 에서 합쳐 보여주는 작업은 다음 PR 에서 진행한다.

## Endpoint

`GET /user/external-posts`

- 인증: 없음
- request body: 없음
- query parameter: 없음
- 상세 endpoint: 없음

## Response

```json
[
  {
    "id": "3d0d48c6-ea1f-4c2b-bd20-9d472a4cccf4",
    "title": "React Query 정리",
    "url": "https://medium.com/...",
    "source": "Medium",
    "category": "frontend",
    "publishedAt": "2026-06-10T00:00:00.000Z",
    "createdAt": "2026-06-10T00:00:00.000Z",
    "updatedAt": "2026-06-10T00:00:00.000Z"
  }
]
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | `string` | `external_posts.id` |
| `title` | `string` | 외부 글 제목 |
| `url` | `string` | 외부 글 원문 URL |
| `source` | `string` | 외부 플랫폼 이름 |
| `category` | `string \| null` | user-web feed 병합용 분류. 현재 DB 컬럼이 없어 `null` 로 응답한다. |
| `publishedAt` | `string \| null` | 외부 플랫폼 발행 시각. 값이 없으면 `null` |
| `createdAt` | `string` | 서버 레코드 생성 시각 |
| `updatedAt` | `string` | 서버 레코드 수정 시각 |

날짜 필드는 모두 ISO8601 문자열이다.

## 정렬 정책

1. `publishedAt DESC NULLS LAST`
2. `createdAt DESC`

발행 시각이 있는 글을 최신 발행순으로 먼저 보여주고, 발행 시각이 없는 글은 뒤로 보낸다. 발행 시각이 같거나 둘 다 없으면 생성 시각 최신순으로 정렬한다.

## 보안

- 공개 read API 라 auth guard 를 적용하지 않는다.
- 생성/수정/삭제는 admin API 에서만 수행한다.
- 외부 URL 검증은 admin create/update 단계에서 수행한다는 전제를 따른다.
- 응답에는 admin 전용 메타데이터를 포함하지 않는다.

## 후속

다음 PR 에서 user-web 글 목록에서 internal posts 와 external_posts 를 병합 노출한다.

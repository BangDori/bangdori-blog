# User External Posts API

## 목적

user-web이 외부 플랫폼에 발행한 글 링크를 읽기 위한 public read API다. 생성, 수정, 삭제는 admin external_posts API에서만 수행한다.

## Endpoint

### GET /user/external-posts

외부 플랫폼에 발행한 글 메타데이터를 공개 목록으로 조회한다.

- Auth: 없음
- Query: 없음
- Body: 없음
- Empty state: `[]`

## Response

`200 OK`

```json
[
  {
    "id": "11111111-1111-1111-1111-111111111111",
    "title": "React Query 정리",
    "url": "https://medium.com/@bangdori/react-query",
    "source": "Medium",
    "category": "frontend",
    "publishedAt": "2026-06-10T00:00:00.000Z",
    "createdAt": "2026-06-10T00:00:00.000Z",
    "updatedAt": "2026-06-10T00:00:00.000Z"
  }
]
```

| Field | Type | Nullable | 설명 |
| --- | --- | --- | --- |
| `id` | `string` | no | 외부 글 ID |
| `title` | `string` | no | 외부 글 제목 |
| `url` | `string` | no | 원문 URL |
| `source` | `string` | no | 외부 플랫폼 이름 |
| `category` | `string` | yes | 분류. 미지정이면 `null` |
| `publishedAt` | `string` | yes | 발행 시각. 미지정이면 `null` |
| `createdAt` | `string` | no | 등록 시각 |
| `updatedAt` | `string` | no | 수정 시각 |

날짜 필드는 UTC ISO string 형식으로 응답한다. `publishedAt`은 `null`일 수 있다.

## 정렬 정책

- 1차: `publishedAt DESC NULLS LAST`
- 2차: `createdAt DESC`

`publishedAt`이 없는 글도 목록에 포함하지만, 발행 시각이 있는 글 뒤에 배치한다.

## 보안

- 공개 read API라 auth guard를 두지 않는다.
- 외부 글 생성, 수정, 삭제는 admin API에서만 수행한다.
- 외부 URL 원문은 admin create/update 단계에서 검증된 값을 그대로 반환한다.

## 제외 범위

이 API는 공개 목록 조회만 제공한다. 아래 항목은 포함하지 않는다.

- `content`
- `slug`
- detail endpoint
- admin CRUD
- status filtering
- soft-delete filtering
- pagination/search
- user-web/UI
- migration

## 후속

다음 PR에서 user-web 목록에서 internal posts와 external_posts를 병합 노출한다.

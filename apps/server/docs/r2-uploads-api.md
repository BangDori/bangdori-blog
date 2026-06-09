# R2 Uploads API — presigned PUT 발급

`POST /admin/uploads/presign` 은 어드민에서 이미지 파일을 Cloudflare R2 로 직접 업로드하기 위한 **presigned PUT URL** 을 발급한다. 서버는 파일 바디를 받지 않고, 짧은 시간 동안 특정 key 에 PUT 할 수 있는 임시 권한만 만든다.

## 책임 분리

| 위치 | 책임 |
|---|---|
| `src/storage/r2` | Cloudflare R2 S3 호환 adapter. `S3Client`, presigned PUT, CDN public URL 생성 |
| `src/admin/uploads` | admin 이미지 업로드 유스케이스. DTO 검증, key 정책, 응답 조립, auth guard |

R2 adapter 는 업로드 도메인 정책을 모른다. `posts/{yyyy}/{mm}/...` 같은 key 규칙과 허용 이미지 타입은 `admin/uploads/uploads-policy.ts` 에 둔다.

## 왜 presigned URL 인가

- 이미지 파일을 NestJS 가 받아 다시 R2 로 올리면 서버 CPU/메모리/대역폭을 이중으로 쓴다.
- presigned URL 방식에서는 서버가 **짧은 만료 시간의 쓰기 권한**만 발급하고, 실제 파일 바이트는 admin UI → R2 로 직접 이동한다.
- 서버는 권한 검사, 파일명/key 규칙, contentType 화이트리스트만 통제한다.

## 쓰기 도메인 / 읽기 도메인 분리

| 용도 | 도메인 |
|---|---|
| 업로드(쓰기) | `*.r2.cloudflarestorage.com` |
| 다운로드(읽기) | `https://cdn.bangdori.kr` |

- `uploadUrl` 은 R2 S3 호환 endpoint 계열이다. Cloudflare custom domain(`cdn.bangdori.kr`) 으로 presigned PUT 을 만들지 않는다.
- `publicUrl` 은 항상 CDN 공개 도메인 기준이다.
- `publicUrl` 은 presign 시점에 계산 가능한 **예상 공개 URL** 이다. 클라이언트는 PUT 성공 후에만 이 값을 본문/썸네일 상태에 저장한다.

## key 규칙

```
posts/{yyyy}/{mm}/{uuid}-{slug}.{ext}
```

| 조각 | 의미 |
|---|---|
| `posts` | 현재 지원하는 upload prefix. 범위가 늘어나면 `uploads-policy.ts` 의 prefix union 확장 |
| `{yyyy}/{mm}` | 업로드 시점의 UTC 연·월. 월은 두 자리 zero-padding |
| `{uuid}` | `crypto.randomUUID()` 결과. 같은 파일명 재업로드도 key 충돌 없음 |
| `{slug}` | 원본 파일명에서 확장자를 뺀 뒤 영문 소문자/숫자/하이픈만 남김. 최대 60자 |
| `{ext}` | 원본 확장자가 아니라 contentType 에서 결정 (`image/jpeg → jpg`) |

한글/공백/특수문자는 raw 로 보존하지 않는다. 영문/숫자/하이픈만 남기고, 결과가 비면 `file` 을 사용한다.

예:

| 입력 | contentType | slug/ext 결과 |
|---|---|---|
| `안녕하세요-Hello World.png` | `image/png` | `hello-world.png` |
| `강아지사진.png` | `image/png` | `file.png` |
| `photo.jpeg` | `image/jpeg` | `photo.jpg` |

## Endpoint

`POST /admin/uploads/presign`

`UploadsController` 는 클래스 단위로 `JwtAccessGuard` 를 적용한다. 인증되지 않은 요청은 presigned URL 발급 로직에 도달하지 않는다.

### Request

```json
{
  "contentType": "image/png",
  "originalFilename": "hello-world.png"
}
```

| 필드 | 규칙 |
|---|---|
| `contentType` | `image/png` · `image/jpeg` · `image/webp` · `image/gif` 중 하나 |
| `originalFilename` | 1~200자, 확장자 `.png/.jpg/.jpeg/.webp/.gif` 중 하나 |

DTO 검증은 class-validator 로 처리한다. `whitelist + forbidNonWhitelisted` 정책 때문에 정의되지 않은 필드는 거부된다.

### Response

```json
{
  "key": "posts/2026/06/8f5c...e2-hello-world.png",
  "uploadUrl": "https://bangdori-blog.<account>.r2.cloudflarestorage.com/posts/2026/06/8f5c...e2-hello-world.png?X-Amz-...",
  "publicUrl": "https://cdn.bangdori.kr/posts/2026/06/8f5c...e2-hello-world.png",
  "expiresInSec": 300
}
```

| 필드 | 의미 |
|---|---|
| `key` | R2 object key |
| `uploadUrl` | R2 로 직접 PUT 할 presigned URL. 만료 300초 |
| `publicUrl` | PUT 성공 후 접근 가능한 CDN URL |
| `expiresInSec` | presigned URL 만료 시간. 기본 300초 |

응답에 R2 access key/secret 같은 시크릿은 포함하지 않는다. `uploadUrl` 자체는 임시 쓰기 권한이므로 로그에 남기지 않는다.

## Admin UI 사용 흐름

1. 파일 선택 또는 drag & drop
2. `POST /admin/uploads/presign`
3. 응답의 `uploadUrl` 로 `PUT`
   - `Content-Type` 헤더는 presign 요청의 `contentType` 과 같아야 한다.
4. PUT 성공 시점에만 `publicUrl` 을 사용
   - 글 작성 이미지: 본문/preview 에 삽입
   - 썸네일: form state 의 `thumbnailUrl` 로 저장
5. PUT 실패 시 presign 응답의 `publicUrl` 은 폐기

## R2/S3 호환성 기준

Cloudflare R2 는 S3 호환 API 를 제공하므로 AWS SDK v3 를 사용한다.

- `S3Client` 설정
  - `region: 'auto'`
  - `endpoint: process.env.R2_S3_ENDPOINT`
  - `credentials: R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY`
- presign 대상
  - `PutObjectCommand`
  - `Bucket`, `Key`, `ContentType` 만 사용
- 사용하지 않는 S3 기능
  - ACL
  - tagging
  - object lock
  - KMS/SSE 설정
  - multipart upload
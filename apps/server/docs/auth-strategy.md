# Admin Auth Strategy

`/admin/**` API 보호 정책. **ATK 단독 + HttpOnly 쿠키** 방식.

## 정책 요약

- ATK(JWT) 1일 만료, `HttpOnly Secure SameSite=Lax` 쿠키(`atk`)로 전달
- 비밀번호는 argon2 hash 만 저장

## 토큰 / 쿠키

| 항목 | 값 |
|---|---|
| 토큰 형식 | JWT (HS256) |
| payload | `{ sub: user.id, email, role }` |
| 만료 | `JWT_ACCESS_EXPIRES_IN` (기본 `1d`) |
| 전달 | `Set-Cookie: atk=<JWT>; HttpOnly; Secure=<COOKIE_SECURE>; SameSite=Lax; Path=/; Domain=<COOKIE_DOMAIN>; Max-Age=<TTL>` |
| 검증 | `JwtAccessStrategy` 가 `req.cookies.atk` 에서 직접 추출 (Authorization 헤더 미사용) |

운영 도메인이 모두 `*.bangdori.kr` 한 부모 도메인 아래라 `SameSite=Lax + Secure` 만으로 admin → api 쿠키가 안정적으로 붙는다.

## Endpoint

| Method | Path | 가드 | 동작 |
|---|---|---|---|
| POST | `/auth/login` | — | 비번 검증 → ATK 쿠키 set + `{ user, accessTokenExpiresAt }` |
| POST | `/auth/logout` | — | ATK 쿠키 clear (204) |
| GET | `/auth/me` | `JwtAccessGuard` | `{ id, email, role }` |
| ALL | `/admin/posts/**`, `/admin/external-posts/**` | `JwtAccessGuard` | 컨트롤러 클래스 단위 |

인증 실패는 401 + 사용자 enumeration 방지용 통일 메시지(`이메일 또는 비밀번호가 올바르지 않습니다`). DTO validation 실패는 400.

## admin 계정 생성

서버 코드에서 자동 seed 하지 않는다 — 평문 비밀번호를 서버 env 에 영구 보관하지 않기 위함.

```bash
# 1) 운영자 로컬에서 hash 생성 (평문은 터미널 + argon2.hash 순간만 존재)
pnpm --filter server hash-password '실제비밀번호'
# → $argon2id$v=19$m=...
```

```sql
-- 2) 대상 DB 에 1회 INSERT
INSERT INTO users (email, password_hash, role)
VALUES ('me@bangdori.kr', '$argon2id$v=19$m=...', 'admin');
```

비밀번호 교체도 같은 절차—새 hash 로 `UPDATE users SET password_hash = '...' WHERE email = '...'`.

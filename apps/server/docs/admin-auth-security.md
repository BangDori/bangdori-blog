# Admin Auth Security

본인 1인 admin + self-host 시나리오 기준 ATK 인증의 위협 모델과 운영 보안 정책

## 위협 모델

| 위협 | 1차 방어선 | 추가 강화 (선택) |
|---|---|---|
| 토큰 탈취 (XSS) | HttpOnly 쿠키로 JS 접근 차단 | CSP 헤더 |
| 토큰 탈취 (중간자) | Secure 플래그 + 운영 https | HSTS |
| CSRF | SameSite=Lax + 같은 부모 도메인 | Origin/Referer 가드 |
| 비번 brute force | argon2 (의도적으로 느린 hash) | rate limit |
| user enumeration | 401 통일 메시지 | — |
| secret 유출 | 환경별 분리 + secret manager | 정기 rotation |

## CSRF 방어선

쿠키 기반 인증의 일반 CSRF 위험은 다음 두 방어선으로 끊긴다.

1. **SameSite=Lax** — cross-site POST/PATCH/DELETE 에 쿠키 자동 첨부 차단 (브라우저 강제)
2. **같은 부모 도메인** (`*.bangdori.kr`) — 서드파티에서 호출해도 위 정책으로 쿠키 안 붙음 → 401

GET top-level navigation 만 쿠키가 붙는데, admin endpoint 는 GET 도 인증 필요지만 idempotent read 라 CSRF 의미가 없다. 즉 **현재 구조에서 실효성 있는 CSRF 공격 경로가 사실상 없다.**

### 추가 강화 (현재 미적용)

`OriginRefererGuard` 를 admin state-changing endpoint(POST/PATCH/DELETE)에 적용 가능. 다음 트리거 중 하나라도 생기면 도입:

- admin user 가 N명으로 다수화
- 모바일/외부 클라이언트 추가
- 공격 시도 로그 발견
- 브라우저 SameSite 정책 약화

## Secret 관리

`JWT_ACCESS_SECRET` 정책:

- **환경별로 반드시 다른 값** — dev/staging/prod 모두 분리. 한 환경 secret 이 새도 다른 환경 토큰 위조 불가
- **운영 secret 은 git/로그/Slack/CI 어디에도 노출 금지** — secret manager (1Password / Doppler / Infisical / AWS Secrets Manager) 에 보관
- **생성**: `openssl rand -base64 32` (32바이트 이상)
- **유출 시**: 즉시 새 secret 생성 → 배포 → 기존 ATK 모두 즉시 무효 → 강제 재로그인

## 로그 redaction

`apps/server/src/logger/logger.module.ts` 의 nestjs-pino 가 다음 헤더를 자동으로 `[REDACTED]` 처리:

- `req.headers.authorization`
- `req.headers.cookie`
- `res.headers["set-cookie"]`

ATK 가 평문으로 로그/Sentry/모니터링 시스템에 남지 않도록 보장.
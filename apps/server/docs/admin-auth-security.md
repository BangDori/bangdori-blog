# Admin Auth Security

본인 1인 admin + self-host 시나리오 기준 ATK 인증의 위협 모델과 운영 보안 정책

## 위협 모델

| 위협 | 1차 방어선 | 추가 강화 (선택) |
|---|---|---|
| 토큰 탈취 (XSS) | HttpOnly 쿠키로 JS 접근 차단 | CSP 헤더 |
| 토큰 탈취 (중간자) | Secure 플래그 + 운영 https | HSTS |
| CSRF | SameSite=Lax + 같은 부모 도메인 | Origin/Referer 가드 |
| 비번 brute force | argon2 (의도적으로 느린 hash) | rate limit |
| user enumeration (응답 메시지) | 401 통일 메시지 | — |
| user enumeration (응답 시간) | verifyDummyPassword 로 argon2 비용 일치 | — |
| secret 유출 | 환경별 분리 + secret manager | 정기 rotation |

## 사용자 enumeration 방어선 (응답 메시지 + 응답 시간)

로그인 실패 응답이 "이메일 존재" / "비번 틀림" 을 구분하면 공격자가 존재하는 admin 계정 email 을 알아낼 수 있다. 두 경로를 더 이상 석이지 않게 세 가지를 맞춘다.

### 1. 응답 메시지 통일

`AuthError.invalidCredentials` 는 한 가지 문구만 쓴다:

> `이메일 또는 비밀번호가 올바르지 않습니다.`

- 이메일 미존재 → 이 메시지
- 비번 불일치 → 이 메시지

응답 본문만 봅서는 둘을 구분할 수 없다.

### 2. 응답 시간 통일

다만 메시지만 통일하면 **응답 시간** 으로 구분될 수 있다:

- 이메일 미존재 → `findByEmail` 만 돌고 즉시 401 (~1ms)
- 비번 불일치 → `findByEmail` + `argon2.verify` 후 401 (~100ms)

공격자가 응답 시간을 측정하면 차이를 구분할 수 있다 (argon2 는 의도적으로 느린 알고리즘이라 편차가 크다).

**해결**: 이메일이 없을 때도 `verifyDummyPassword` 를 호출해 argon2 비용을 동일하게 소모한다.

```ts
// AuthService.login
const user = await this.users.findByEmail(email);
const ok = user
  ? await this.users.verifyPassword(user, password)
  : await this.users.verifyDummyPassword(password);
if (!user || !ok) {
  throw new UnauthorizedException(AuthError.invalidCredentials);
}
```

```ts
// UsersService.verifyDummyPassword
// process 시작 시 한 번 만든 dummy argon2 hash 와 verify 수행 → 자체는 항상 false 반환
const dummyHashPromise = argon2.hash(randomBytes(32).toString('hex'));
async verifyDummyPassword(plain: string): Promise<boolean> {
  const dummyHash = await dummyHashPromise;
  await argon2.verify(dummyHash, plain).catch(() => false);
  return false;
}
```

dummy hash 가 process 단위 random 값이라 공격자가 머맓 잡아도 재활용 불가.

### 3. (선택) rate limit

시간 통일이 되어도 충분한 시도 횟수가 필요한 공격은 탐지될 수 있으므로 향후 `POST /auth/login` 에 rate limit (e.g., IP 당 5시도/분) 를 추가하는 것을 검토한다 (현재 PR 의 범위 외).

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
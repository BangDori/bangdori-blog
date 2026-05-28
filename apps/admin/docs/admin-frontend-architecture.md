# Admin Frontend Architecture

`apps/admin` (Vite + React 19 + react-router-dom 7) 의 페이지 구조와 레이어 기준.

## 1. 레이어와 의존

의존은 **위에서 아래로 단방향**

```text
[Entry]   main.tsx / app.tsx
[L4]      components (앱 shell)        # router 결합
[L3]      pages       (route 1:1)
[L2]      domains/{domain}              # api / model / ui 응집
[L1]      shared      (ui / lib / icons)
```

## 2. 폴더 구조

```text
apps/admin/src/
├── app.tsx                            # 라우트 선언만
├── main.tsx                           # BrowserRouter, QueryProvider bootstrap
├── globals.css
├── components/                        # 앱 shell (단일 인스턴스, dumb)
│   ├── layout/
│   │   ├── index.tsx                  # entry — auth context provider + Outlet
│   │   └── {sidebar,top-bar,auth-context}.tsx
│   └── {query-provider,theme-provider}.tsx
├── pages/                             # 라우트 1:1 + layout-route
│   ├── protected.tsx                  # 보호 라우트의 layout-route
│   ├── dashboard.tsx
│   ├── auth/login.tsx
│   └── posts/{list,create,edit}.tsx
├── domains/{domain}/                  # 도메인 응집 (예: auth, posts)
│   ├── index.ts                       # public barrel — 외부 사용처 있는 것만 노출
│   ├── api/
│   │   ├── index.ts                   # raw fetch
│   │   └── {keys,mutations,queries,errors}.ts
│   ├── model/                         # types, schema(zod), constants
│   └── ui/                            # 도메인 컴포넌트
└── shared/                            # 도메인·라우터 무관
    ├── ui/                            # React 원자 컴포넌트 (Button, Input, Notice, …)
    ├── lib/                           # 비-React 유틸 (http, routes, cn, date, theme)
    └── icons/                         # Icon + IconName union
```

**이름 규칙**: kebab-case, 컴포넌트 export 는 PascalCase. domain 폴더명은 복수형(`posts`).

## 3. 운영 규칙

| # | 규칙 |
|---|---|
| R1 | page 끼리 import 금지. 페이지간 이동은 `shared/lib/routes.ts` 의 string 상수만 |
| R2 | domain 끼리 import 금지. 공유 필요 시 `shared/` 로 승격 |
| R3 | 도메인 타입은 `domains/{domain}/model/` 안에서 소유. 외부엔 barrel(`index.ts`) 만 — 실제 외부 사용처 있는 것만 노출 |
| R4 | 부수효과(navigate, confirm, localStorage, fetch, toast)는 L3/L4 에서만. L2/L1 은 순수 |
| R5 | 같은 도메인 내부는 상대경로, 경계 넘으면 layer alias (`@components`, `@pages`, `@domains`, `@shared`). 자세한 내용은 [admin-import-rules.md](./admin-import-rules.md) |
| R6 | 순환 의존 금지 |
| R7 | R1~R3 은 ESLint(`boundaries` + `no-restricted-imports`) 가 강제. `pnpm --filter admin lint` |

## 4. 인증

서버 정책은 [`apps/server/docs/auth-strategy.md`](../../server/docs/auth-strategy.md). 클라이언트 정책은 아래와 같다.

### 4.1 토큰 / 401 정책

| 항목 | 정책 |
|---|---|
| 서버 → 클라 | `Set-Cookie: atk` (httpOnly, Max-Age 1d, `Secure SameSite=Lax`) |
| 클라 → 서버 | `credentials: 'include'`. `Authorization` 헤더 미사용 |
| 토큰 보관 | **금지** — `localStorage` / `sessionStorage` / `js-cookie` 등에 두지 않는다 (XSS 읽기 위험 최소화) |
| 인증 상태 | `/auth/me` 성공 여부 (`useMe`) = 단일 진실 원천 |
| 401 인터셉터 | `shared/lib/http.ts` 가 `window.location.assign(ROUTES.login)` |
| 401 우회 | `skipAuthRedirect: true` — `me()`, `login()` 호출 (인증 자체를 다루는 API) |
| refresh | **없음** — ATK 만료 시 다시 로그인 |

### 4.2 보호 라우트 + dumb shell

`pages/protected.tsx` 가 layout-route 역할:
- `useMe` + `useLogout` 호출
- 401 → `Navigate(/login, state.from)`, data 없음 → splash, 성공 → `<Layout auth={{ email, onLogout }} />`

`components/layout/*` 은 dumb — `@domains/auth` 에 직접 의존하지 않는다. `Layout` 이 `auth` props 를 받아 `LayoutAuthProvider` 로 감싸고, `Sidebar`(로그아웃 버튼) / `TopBar`(이메일 표시) 는 `useLayoutAuth()` 로 consume.

→ ESLint 룰의 단방향성(`components → shared` 만) 유지.

### 4.3 로그인 / 로그아웃

- **로그인**: `useLogin.onSuccess` 에서 `setQueryData(authKeys.me, res.user)` — 단순 `invalidate` 하면 이전 401 캐시가 남아 `ProtectedRoute` 가 잠깐 `/login` 으로 되돌릴 수 있는 race 가 있다.
- **로그아웃**: `useLogout.onSettled` 에서 `removeQueries(authKeys.all)`. ATK 쿠키 clear 는 서버가 `Set-Cookie` 로 처리. 호출자(`ProtectedRoute`) 가 `navigate(ROUTES.login, { replace: true })`.

### 4.4 운영 도메인 제약

서버 쿠키 `SameSite=Lax + Secure` 정책상 admin(`admin.bangdori.kr`) 과 API(`api.bangdori.kr`) 는 같은 부모 도메인(`*.bangdori.kr`) 아래에 있어야 쿠키가 자동 전송된다. 로컬에서는 `COOKIE_SECURE=false` + `COOKIE_DOMAIN` 공백 + `CORS_ORIGINS` 에 admin dev origin 포함 (서버 env 책임).

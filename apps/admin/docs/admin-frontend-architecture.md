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
├── app.tsx               # 라우트 선언만
├── main.tsx              # BrowserRouter, QueryProvider bootstrap
├── globals.css
├── components/           # 앱 shell (단일 인스턴스)
│   ├── layout.tsx
│   └── query-provider.tsx
├── pages/                # 라우트 1:1
│   ├── dashboard.tsx
│   └── posts/{list,new,edit}.tsx
├── domains/{domain}/     # 도메인 응집
│   ├── index.ts          # public API barrel
│   ├── api/              # raw fetch + react-query hooks
│   │   ├── index.ts
│   │   └── queries.ts
│   ├── model/            # types, constants, filter (+ 폼 도입 시 schema.ts)
│   └── ui/               # 도메인 컴포넌트 (table, status-filter, badge ...)
└── shared/               # 도메인·라우터 무관
    ├── ui/               # React 원자 컴포넌트 (Button, ErrorAlert, Notice, Display, QueryBoundary ...)
    ├── lib/              # 비-React 유틸 (http, cn, date, routes)
    └── icons/            # Icon + IconName union
```

**이름 규칙**: kebab-case, 컴포넌트 export 는 PascalCase. domain 폴더명은 복수형(`posts`).

## 3. 운영 규칙

다이어그램/표/import 룰로 표현되지 않는 정책

| # | 규칙 |
|---|---|
| R1 | page 끼리 import 금지. 페이지간 이동은 `shared/lib/routes.ts` 의 string 상수만 |
| R2 | domain 끼리 import 금지. 공유 필요 시 `shared/` 로 승격 (= 도메인 경계 설계 시그널) |
| R3 | 도메인 타입은 `domains/{domain}/model/` 안에서 소유. 외부엔 barrel(`domains/{domain}/index.ts`)만 노출 |
| R4 | 부수효과(`navigate`, `confirm`, `localStorage`, `fetch`, toast)는 L3/L4 에서만. L2/L1 은 순수 함수 |
| R5 | 같은 도메인 내부는 상대경로, 도메인·레이어 경계 넘으면 `@/` 절대경로 강제 |
| R6 | 순환 의존 금지. 발생 시 도메인 경계 설계 실수로 본다 |

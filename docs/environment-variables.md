# 환경변수 관리 가이드

## 왜 Infisical을 쓰는가

시크릿(API 토큰, DB 비밀번호, RSA 키 등)을 `.env` 파일로 직접 관리하면 다음 문제가 생긴다:

- **공유 불가** — `.gitignore`로 제외되어 있어서, 새 환경을 셋업할 때마다 누군가에게 파일을 달라고 해야 한다.
- **동기화 없음** — 시크릿이 바뀌면 모든 개발자·서버에 수동으로 전파해야 한다.
- **환경 구분 어려움** — dev/prod 시크릿이 어디에 어떤 값으로 있는지 한눈에 안 보인다.

[Infisical](https://infisical.com)은 이 문제를 해결하는 시크릿 매니저다. 웹 대시보드에서 시크릿을 중앙 관리하고, CLI(`infisical export`)로 로컬에 `.env` 파일을 생성한다. 시크릿의 **SSOT(Single Source of Truth)는 Infisical 서버**이고, 로컬 `.env` 파일은 그 스냅샷이다.

## Infisical 프로젝트 구성

모노레포의 앱 3개가 각각 별도의 Infisical 프로젝트(워크스페이스)에 매핑된다:

| 앱 디렉토리 | 용도 |
|---|---|
| `apps/user-web` | Next.js 블로그 프론트엔드 |
| `apps/admin` | CMS 관리 페이지 |
| `apps/server` | NestJS API 서버 |

각 디렉토리의 `.infisical.json`은 해당 워크스페이스 ID만 가지고 있다. `infisical export`를 실행하면 이 파일을 읽어서 어떤 프로젝트의 시크릿을 가져올지 결정한다.

## setup.sh 동작 흐름

`./setup.sh [dev|prod]`를 실행하면 Infisical에서 시크릿을 내려받아 각 앱의 `.env` 파일을 생성하고, 의존성까지 설치한다.

### 1단계: 환경 결정

```bash
ENV="${1:-dev}"   # 인자 없으면 dev

case "$ENV" in
  dev)  ENV_SLUG="dev";  ENV_SUFFIX="development" ;;
  prod) ENV_SLUG="prod"; ENV_SUFFIX="production"  ;;
esac
```

- `ENV_SLUG` → Infisical 환경 이름 (`infisical export --env="dev"`)
- `ENV_SUFFIX` → 생성할 파일 이름 (`.env.development` 또는 `.env.production`)

### 2단계: Infisical 인증 확인

```bash
token=$(infisical user get token --plain)
```

로컬에 캐시된 Infisical JWT 토큰이 유효한지 확인한다. 토큰이 없거나 형식이 잘못되면 `infisical login`을 먼저 실행하라고 안내하고 종료한다.

### 3단계: 앱별 `.env` 생성 (`generate_env`)

3개 디렉토리(`apps/user-web`, `apps/admin`, `apps/server`)에 대해 동일한 로직을 반복한다:

```
cd {앱 디렉토리}
infisical export --env="dev" > .env.development
```

- `infisical export`는 해당 디렉토리의 `.infisical.json`에서 workspaceId를 읽고, 지정된 환경(`dev`/`prod`)의 시크릿을 `KEY=VALUE` 형식으로 stdout에 출력한다.
- 출력을 `.env.{ENV_SUFFIX}` 파일로 리다이렉트한다.
- `.env.{ENV_SUFFIX}`를 `.env`로도 복사한다 — 프레임워크에 따라 `.env`만 읽는 경우가 있기 때문.

### 4단계: 의존성 설치

```bash
pnpm install --frozen-lockfile
```

lockfile 기준으로 의존성을 설치한다. `--frozen-lockfile`이므로 lockfile이 깨져 있으면 실패한다.

### 전체 흐름 요약

```
./setup.sh dev
  ├─ 환경 결정 (dev → ENV_SLUG="dev", ENV_SUFFIX="development")
  ├─ Infisical 토큰 검증
  ├─ apps/user-web/
  │   └─ infisical export --env=dev → .env.development + .env
  ├─ apps/admin/
  │   └─ infisical export --env=dev → .env.development + .env
  ├─ apps/server/
  │   └─ infisical export --env=dev → .env.development + .env
  └─ pnpm install --frozen-lockfile
```

## 처음 셋업하는 사람이 할 일

```bash
# 1. Infisical CLI 설치 (macOS)
brew install infisical/get-cli/infisical

# 2. 로그인 (웹 브라우저 인증)
infisical login

# 3. 환경변수 생성 + 의존성 설치
./setup.sh dev
```

이후 Infisical 대시보드에서 시크릿이 변경되면 `./setup.sh dev`를 다시 실행하면 된다.

## 시크릿 변경 시

1. **Infisical 대시보드**에서 값을 수정한다 (SSOT).
2. 로컬에서 `./setup.sh dev`를 다시 실행해 `.env` 파일을 갱신한다.
3. 프로덕션 배포 시에는 `./setup.sh prod`로 prod 환경의 시크릿을 내려받거나, CI/CD 파이프라인에서 `infisical export`를 실행한다.

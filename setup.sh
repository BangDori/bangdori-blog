#!/usr/bin/env bash
set -euo pipefail

# Usage: ./setup.sh [env] [app]
#   env: dev (default) | prod
#   app: all (default) | server | user-web | admin
#
# 동작:
#   - infisical export --env <env> --path /<app> --format dotenv
#     을 수행해 결과를 apps/<app>/.env 와 apps/<app>/.env.<suffix> 두 곳에 저장
#       env=dev  → .env, .env.development
#       env=prod → .env, .env.production
#   - app=all 이면 server / user-web / admin 순으로 모두 export
#
# 정책:
#   - 워크스페이스는 bangdori-blog 단일
#   - path 분리:
#       /server   → 서버 전용 (DB, R2, JWT, NOTION_TOKEN ...)
#       /user-web → Next.js (NEXT_PUBLIC_*, 일부 서버 secret)
#       /admin    → SPA (VITE_* 만)

usage() {
  cat <<EOF
Usage: ./setup.sh [env] [app]

  env: dev (default) | prod
  app: all (default) | server | user-web | admin

Examples:
  ./setup.sh                # dev / all
  ./setup.sh dev server
  ./setup.sh dev user-web
  ./setup.sh dev admin
  ./setup.sh prod all
EOF
}

ENV_ARG="${1:-dev}"
APP_ARG="${2:-all}"

case "$ENV_ARG" in
  dev)  ENV_SUFFIX="development" ;;
  prod) ENV_SUFFIX="production"  ;;
  -h|--help) usage; exit 0 ;;
  *)
    echo "❌ 지원하지 않는 환경입니다: $ENV_ARG"
    usage
    exit 1
    ;;
esac

case "$APP_ARG" in
  all|server|user-web|admin) ;;
  *)
    echo "❌ 지원하지 않는 앱입니다: $APP_ARG"
    usage
    exit 1
    ;;
esac

if ! command -v infisical >/dev/null 2>&1; then
  echo "❌ infisical CLI가 설치되어 있지 않습니다."
  echo "   설치: brew install infisical/get-cli/infisical"
  exit 1
fi

token=$(infisical user get token --plain </dev/null 2>/dev/null || true)
if [ -z "$token" ] || ! echo "$token" | grep -qE '^[^.]+\.[^.]+\.[^.]+$'; then
  echo "❌ Infisical 로그인이 필요합니다. 'infisical login' 을 실행하세요."
  exit 1
fi

if [ "$ENV_ARG" = "prod" ]; then
  echo "⚠️  prod 환경의 시크릿을 내려받습니다. 운영 자격증명을 사용합니다."
  read -r -p "계속하시겠습니까? [y/N] " confirm </dev/tty
  case "$confirm" in
    y|Y|yes|YES) ;;
    *) echo "취소됨."; exit 1 ;;
  esac
fi

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

export_one() {
  local app="$1"
  local app_dir="${REPO_ROOT}/apps/${app}"
  local path_value="/${app}"
  local env_file="${app_dir}/.env"
  local suffix_file="${app_dir}/.env.${ENV_SUFFIX}"

  if [ ! -d "$app_dir" ]; then
    echo "❌ ${app_dir} 디렉토리가 없습니다."
    return 1
  fi

  echo "📂 [${app}] env=${ENV_ARG} path=${path_value}"

  if ! ( cd "$app_dir" && infisical export \
      --env="$ENV_ARG" \
      --path="$path_value" \
      --format=dotenv \
      > "$env_file" 2>/tmp/infisical-stderr </dev/null ); then
    echo "❌ [${app}] infisical export 실패"
    cat /tmp/infisical-stderr >&2 || true
    return 1
  fi

  if [ ! -s "$env_file" ]; then
    echo "⚠️  [${app}] ${env_file}가 비어 있습니다. Infisical 워크스페이스/path/env를 확인하세요."
    return 0
  fi

  cp "$env_file" "$suffix_file"

  echo "✅ [${app}] 생성: ${env_file}"
  echo "✅ [${app}] 생성: ${suffix_file}"
}

run_for_app() {
  local app="$1"
  export_one "$app"
}

case "$APP_ARG" in
  all)
    run_for_app server
    run_for_app user-web
    run_for_app admin
    ;;
  *)
    run_for_app "$APP_ARG"
    ;;
esac

echo ""
echo "🎉 setup 완료 (env=${ENV_ARG}, app=${APP_ARG})"

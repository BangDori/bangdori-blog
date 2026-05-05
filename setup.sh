#!/usr/bin/env bash
set -euo pipefail

ENV="${1:-dev}"

case "$ENV" in
  dev)  ENV_SLUG="dev";  ENV_SUFFIX="development" ;;
  prod) ENV_SLUG="prod"; ENV_SUFFIX="production"  ;;
  *)
    echo "❌ 지원하지 않는 환경입니다: $ENV (dev | prod)"
    exit 1
    ;;
esac

echo "🔧 환경: $ENV_SUFFIX"

token=$(infisical user get token --plain </dev/null 2>/dev/null)
if [ -z "$token" ] || ! echo "$token" | grep -qE '^[^.]+\.[^.]+\.[^.]+$'; then
  echo "❌ Infisical 로그인이 필요합니다. 'infisical login' 을 실행하세요."
  exit 1
fi
echo "✅ Infisical 인증 확인 완료"

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

generate_env() {
  local app_dir="$1"
  local out_file=".env.${ENV_SUFFIX}"

  echo "📂 ${app_dir} → ${out_file}"
  cd "${REPO_ROOT}/${app_dir}"

  if ! infisical export --env="$ENV_SLUG" > "$out_file" 2>/tmp/infisical-stderr </dev/null; then
    echo "❌ ${app_dir} Infisical export 실패"
    cat /tmp/infisical-stderr >&2
    cd - > /dev/null
    return 1
  fi

  if [ ! -s "$out_file" ]; then
    echo "⚠️  ${app_dir} ${out_file}가 비어 있습니다. Infisical 프로젝트·환경을 확인하세요."
    cd - > /dev/null
    return 0
  fi

  if grep -q '^GH_TOKEN=' "$out_file"; then
    sed -i '' 's/^GH_TOKEN=/GITHUB_TOKEN=/' "$out_file"
  fi

  cd - > /dev/null
  echo "✅ ${app_dir} ${out_file} 생성 완료"
}

generate_env "apps/user-web"  || exit 1
generate_env "apps/server"    || exit 1
generate_env "infra/docker"   || exit 1

echo ""
echo "📦 의존성 설치 시작"
if ! pnpm install --frozen-lockfile; then
  echo "❌ 의존성 설치 실패"
  exit 1
fi
echo "✅ 의존성 설치 완료"

echo ""
echo "🎉 setup 완료 (환경: ${ENV_SUFFIX})"

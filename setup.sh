#!/bin/zsh

# 1) Infisical 로그인 확인
token=$(infisical user get token --plain </dev/null 2>/dev/null)
if [ -z "$token" ] || ! echo "$token" | grep -qE '^[^.]+\.[^.]+\.[^.]+$'; then
  echo "❌ Infisical 로그인이 필요합니다. 'infisical login' 을 실행하세요."
  exit 1
fi
echo "✅ Infisical 인증 확인 완료"

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

# 2) 앱별 .env export
generate_env_files() {
  local app_path=$1
  echo "📂 ${app_path} env 생성..."
  cd "${REPO_ROOT}/${app_path}"

  if ! infisical export --env=dev > .env 2>/tmp/infisical-stderr </dev/null; then
    echo "❌ ${app_path} Infisical export 실패"
    cat /tmp/infisical-stderr >&2
    cd - > /dev/null
    return 1
  fi

  if [ ! -s .env ]; then
    echo "❌ ${app_path} .env가 비어 있습니다. Infisical 프로젝트·환경을 확인하세요."
    cd - > /dev/null
    return 1
  fi

  if grep -q '^GH_TOKEN=' .env; then
    sed -i '' 's/^GH_TOKEN=/GITHUB_TOKEN=/' .env
  fi

  cd - > /dev/null
  echo "✅ ${app_path} env 생성 완료"
}

generate_env_files "apps/user-web" || exit 1

# 3) 의존성 설치
echo "📦 의존성 설치 시작"
pnpm install --frozen-lockfile
echo "✅ 의존성 설치 완료"

echo "🎉 setup 완료"

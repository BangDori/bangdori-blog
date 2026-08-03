#!/usr/bin/env bash
set -euo pipefail

# Infisical에서 시크릿을 내려받아 루트 .env 파일을 생성한다.

if [ "$#" -ne 0 ]; then
  echo "Usage: ./setup.sh"
  exit 1
fi

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

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="${REPO_ROOT}/.env"
EXPORT_FILE="$(mktemp)"
ERROR_FILE="$(mktemp)"
trap 'rm -f "$EXPORT_FILE" "$ERROR_FILE"' EXIT

echo "📂 Infisical 시크릿 다운로드"

if ! (cd "$REPO_ROOT" && infisical export \
  --path="/" \
  --format=dotenv \
  >"$EXPORT_FILE" 2>"$ERROR_FILE" </dev/null); then
  echo "❌ Infisical export 실패"
  cat "$ERROR_FILE" >&2 || true
  exit 1
fi

if [ ! -s "$EXPORT_FILE" ]; then
  echo "❌ export 결과가 비어 있습니다. Infisical 설정을 확인하세요."
  exit 1
fi

cp "$EXPORT_FILE" "$ENV_FILE"
chmod 600 "$ENV_FILE"

echo "✅ 생성: ${ENV_FILE}"
echo "🎉 setup 완료"

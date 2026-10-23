#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

APP_ROOT=${APP_ROOT:-/opt/starcity/app}
RUNTIME_ENV_FILE=${RUNTIME_ENV_FILE:-/opt/starcity/shared/runtime.env}
EXPECTED_PNPM_VERSION='11.12.0'
EXPECTED_PM2_VERSION='6.0.14'

if [[ "$(id -u)" -eq 0 ]]; then
  echo 'Run deployment as the non-root ubuntu user; do not run PM2 as root.' >&2
  exit 2
fi
if [[ ! -f "$APP_ROOT/pnpm-workspace.yaml" || ! -f "$APP_ROOT/pnpm-lock.yaml" ]]; then
  echo 'APP_ROOT must be the repository checkout.' >&2
  exit 2
fi
if [[ ! -r "$APP_ROOT/.nvmrc" ]]; then
  echo "Node version file is missing: $APP_ROOT/.nvmrc" >&2
  exit 2
fi
EXPECTED_NODE_VERSION=$(tr -d '[:space:]' < "$APP_ROOT/.nvmrc")
NODE_BIN=$(command -v node || true)
if [[ -z "$NODE_BIN" || ! -x "$NODE_BIN" ]]; then
  echo 'Node.js is not available on PATH. Run deployment/ec2/install-host.sh as root.' >&2
  exit 2
fi
NODE_BIN=$(readlink -f "$NODE_BIN")
export PATH="$(dirname "$NODE_BIN"):/usr/local/bin:$PATH"
if [[ ! -r "$RUNTIME_ENV_FILE" ]]; then
  echo "Runtime env file is missing or unreadable: $RUNTIME_ENV_FILE" >&2
  exit 2
fi
if [[ "$(node --version)" != "v$EXPECTED_NODE_VERSION" ]]; then
  echo "Node.js v$EXPECTED_NODE_VERSION is required; found $(node --version) at $(command -v node). Run deployment/ec2/install-host.sh as root." >&2
  exit 2
fi
if [[ "$(pnpm --version)" != "$EXPECTED_PNPM_VERSION" ]]; then
  echo "pnpm $EXPECTED_PNPM_VERSION is required; found $(pnpm --version). Run deployment/ec2/install-host.sh as root." >&2
  exit 2
fi
if [[ "$(pm2 --version)" != "$EXPECTED_PM2_VERSION" ]]; then
  echo "PM2 $EXPECTED_PM2_VERSION is required; found $(pm2 --version). Run deployment/ec2/install-host.sh as root." >&2
  exit 2
fi
for command in pnpm pm2 docker curl; do
  command -v "$command" >/dev/null || { echo "Required command not found: $command" >&2; exit 2; }
done

set -a
# shellcheck disable=SC1090 # Runtime env is an operator-owned mode-600 file outside the checkout.
source "$RUNTIME_ENV_FILE"
set +a

: "${NEXT_PUBLIC_API_ENDPOINT:?Set the public API URL in runtime.env}"
: "${NEXT_PUBLIC_WEB_DOMAIN:?Set the public web URL in runtime.env}"
: "${NEXT_PUBLIC_MANAGE_DOMAIN:?Set the public manage URL in runtime.env}"
for url in "$NEXT_PUBLIC_API_ENDPOINT" "$NEXT_PUBLIC_WEB_DOMAIN" "$NEXT_PUBLIC_MANAGE_DOMAIN"; do
  [[ "$url" == https://* ]] || { echo "Public production URLs must use HTTPS: $url" >&2; exit 2; }
done

API_ENV_LINK="$APP_ROOT/apps/api/.env"
if [[ -e "$API_ENV_LINK" && ! -L "$API_ENV_LINK" ]]; then
  echo "$API_ENV_LINK exists and is not a symlink. Move its local contents outside the repo, then retry." >&2
  exit 2
fi
ln -sfn "$RUNTIME_ENV_FILE" "$API_ENV_LINK"

docker compose \
  --project-name starcity-local-dependencies \
  --env-file "$RUNTIME_ENV_FILE" \
  -f "$APP_ROOT/deployment/ec2/compose.dependencies.yaml" \
  up -d --wait --wait-timeout 180 mongodb mysql

cd "$APP_ROOT"
pnpm install --frozen-lockfile

# Next.js public settings are compiled into its production bundle.
export NEXT_PUBLIC_ENV=${NEXT_PUBLIC_ENV:-production}
pnpm --filter api build
pnpm --filter manage build
pnpm --filter web build

for app in manage web; do
  standalone="$APP_ROOT/apps/$app/.next/standalone/apps/$app"
  if [[ ! -f "$standalone/server.js" ]]; then
    echo "Next.js standalone server missing: $standalone/server.js" >&2
    echo "Ensure apps/$app/next.config enables output: standalone and the monorepo tracing root." >&2
    exit 1
  fi
  mkdir -p "$standalone/.next"
  rm -rf "$standalone/.next/static" "$standalone/public"
  cp -a "$APP_ROOT/apps/$app/.next/static" "$standalone/.next/static"
  if [[ -d "$APP_ROOT/apps/$app/public" ]]; then
    cp -a "$APP_ROOT/apps/$app/public" "$standalone/public"
  fi
done

pm2 startOrReload "$APP_ROOT/deployment/ec2/ecosystem.config.cjs" --update-env
pm2 save

curl --fail --silent --show-error --retry 20 --retry-all-errors --retry-delay 2 \
  --max-time 10 http://127.0.0.1:8000/healthz >/dev/null
curl --fail --silent --show-error --retry 20 --retry-all-errors --retry-delay 2 \
  --max-time 10 http://127.0.0.1:3000/auth/login >/dev/null
curl --fail --silent --show-error --retry 20 --retry-all-errors --retry-delay 2 \
  --max-time 10 http://127.0.0.1:3001/robots.txt >/dev/null

echo 'API, manage, and web processes are healthy.'
pm2 status
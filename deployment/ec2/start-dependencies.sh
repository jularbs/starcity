#!/usr/bin/env bash
set -Eeuo pipefail

APP_ROOT=${APP_ROOT:-/opt/starcity/app}
RUNTIME_ENV_FILE=${RUNTIME_ENV_FILE:-/opt/starcity/shared/runtime.env}

[[ "$(id -u)" -ne 0 ]] || { echo 'Run as ubuntu, not root.' >&2; exit 2; }
[[ -r "$RUNTIME_ENV_FILE" ]] || { echo "Cannot read $RUNTIME_ENV_FILE" >&2; exit 2; }

docker compose \
  --project-name starcity-local-dependencies \
  --env-file "$RUNTIME_ENV_FILE" \
  -f "$APP_ROOT/deployment/ec2/compose.dependencies.yaml" \
  up -d --wait --wait-timeout 180 mongodb mysql
docker compose \
  --project-name starcity-local-dependencies \
  --env-file "$RUNTIME_ENV_FILE" \
  -f "$APP_ROOT/deployment/ec2/compose.dependencies.yaml" ps
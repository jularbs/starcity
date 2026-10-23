#!/usr/bin/env bash
set -Eeuo pipefail

APP_ROOT=${APP_ROOT:-/opt/starcity/app}
export APP_ROOT
EXPECTED_NODE_VERSION=$(tr -d '[:space:]' < "$APP_ROOT/.nvmrc")
NODE_ROOT="/opt/node-v$EXPECTED_NODE_VERSION"

if [[ ! -x "$NODE_ROOT/bin/node" ]]; then
  echo "Pinned Node.js binary is missing: $NODE_ROOT/bin/node. Run deployment/ec2/install-host.sh as root." >&2
  exit 2
fi
export PATH="$NODE_ROOT/bin:/usr/local/bin:$PATH"
if [[ "$(node --version)" != "v$EXPECTED_NODE_VERSION" ]]; then
  echo "Pinned Node.js v$EXPECTED_NODE_VERSION did not resolve first on PATH; found $(node --version) at $(command -v node)." >&2
  exit 2
fi

if [[ "$(id -u)" -eq 0 ]]; then
  echo 'Run as the non-root ubuntu deployment user.' >&2
  exit 2
fi
if [[ ! -d "$APP_ROOT/.git" ]]; then
  echo "Repository checkout not found: $APP_ROOT" >&2
  exit 2
fi

cd "$APP_ROOT"
if [[ -n "$(git status --porcelain)" ]]; then
  echo 'Working tree has local changes; refusing to overwrite them.' >&2
  exit 2
fi

git fetch origin develop
git checkout develop
git pull --ff-only origin develop
bash "$APP_ROOT/deployment/ec2/deploy.sh"
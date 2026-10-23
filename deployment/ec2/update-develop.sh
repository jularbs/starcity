#!/usr/bin/env bash
set -Eeuo pipefail

APP_ROOT=${APP_ROOT:-/opt/starcity/app}
export APP_ROOT
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
if [[ "$(node --version)" != "v$EXPECTED_NODE_VERSION" ]]; then
  echo "Node.js v$EXPECTED_NODE_VERSION is required; found $(node --version) at $(command -v node). Run deployment/ec2/install-host.sh as root." >&2
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
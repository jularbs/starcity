#!/usr/bin/env bash
set -Eeuo pipefail

APP_ROOT=${APP_ROOT:-/opt/starcity/app}

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
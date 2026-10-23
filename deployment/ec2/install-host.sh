#!/usr/bin/env bash
set -Eeuo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo 'Run as root with sudo on Ubuntu 24.04 x86-64.' >&2
  exit 2
fi
if ! grep -q 'VERSION_ID="24.04"' /etc/os-release; then
  echo 'This installer targets Ubuntu 24.04.' >&2
  exit 2
fi
if [[ "$(dpkg --print-architecture)" != amd64 ]]; then
  echo 'This installer targets x86-64/amd64.' >&2
  exit 2
fi
if ! id ubuntu >/dev/null 2>&1; then
  echo 'Expected Ubuntu deployment account "ubuntu" was not found.' >&2
  exit 2
fi

APP_ROOT=${APP_ROOT:-/opt/starcity/app}
NODE_VERSION_FILE="$APP_ROOT/.nvmrc"
if [[ ! -r "$NODE_VERSION_FILE" ]]; then
  echo "Node version file not found: $NODE_VERSION_FILE. Clone the repository before installing the host." >&2
  exit 2
fi
NODE_VERSION=$(tr -d '[:space:]' < "$NODE_VERSION_FILE")
if [[ "$NODE_VERSION" != '24.22.1' ]]; then
  echo "This host installer has a verified archive checksum only for Node 24.22.1; found $NODE_VERSION." >&2
  exit 2
fi
NODE_ARCHIVE_SHA256='6c172a9ab6718f7b801fb5a7bd486af2ee5e32758086a04b84fcce2aa77095e6'
NODE_ROOT="/opt/node-v$NODE_VERSION"
PNPM_VERSION='11.12.0'
PM2_VERSION='6.0.14'

export DEBIAN_FRONTEND=noninteractive
apt-get -o Acquire::Retries=5 -o DPkg::Lock::Timeout=120 update
apt-get -o Acquire::Retries=5 -o DPkg::Lock::Timeout=120 install -y \
  ca-certificates curl git gnupg nginx util-linux xz-utils

install -m 0755 -d /etc/apt/keyrings
curl --fail --silent --show-error --retry 5 \
  https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
printf 'deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu noble stable\n' \
  > /etc/apt/sources.list.d/docker.list

apt-get -o Acquire::Retries=5 -o DPkg::Lock::Timeout=120 update
apt-get -o Acquire::Retries=5 -o DPkg::Lock::Timeout=120 install -y \
  docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

node_archive=$(mktemp)
node_staging=$(mktemp -d /opt/node-install.XXXXXX)
trap 'rm -f "$node_archive"; rm -rf "$node_staging"' EXIT
curl --fail --silent --show-error --retry 5 \
  "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
  -o "$node_archive"
printf '%s  %s\n' "$NODE_ARCHIVE_SHA256" "$node_archive" | sha256sum --check --status
tar -xJf "$node_archive" --strip-components=1 -C "$node_staging"
rm -rf "$NODE_ROOT"
mv "$node_staging" "$NODE_ROOT"
for executable in node npm npx corepack; do
  ln -sfn "$NODE_ROOT/bin/$executable" "/usr/local/bin/$executable"
done
export PATH="$NODE_ROOT/bin:/usr/local/bin:$PATH"
hash -r
npm install --global --prefix /usr/local "pnpm@$PNPM_VERSION" "pm2@$PM2_VERSION"
usermod -aG docker ubuntu

ssm_agent_deb=$(mktemp)
curl --fail --silent --show-error --retry 5 \
  https://s3.ap-southeast-1.amazonaws.com/amazon-ssm-ap-southeast-1/latest/debian_amd64/amazon-ssm-agent.deb \
  -o "$ssm_agent_deb"
dpkg -i "$ssm_agent_deb"
rm -f "$ssm_agent_deb"

systemctl enable --now docker nginx amazon-ssm-agent
systemctl is-active --quiet amazon-ssm-agent
install -d -o ubuntu -g ubuntu -m 0750 /opt/starcity/app /opt/starcity/shared
install -d -o root -g root -m 0700 /opt/starcity/shared/tls

[[ "$(command -v node)" == "$NODE_ROOT/bin/node" ]] || { echo 'Pinned Node.js is not first on PATH.' >&2; exit 1; }
[[ "$(node --version)" == "v$NODE_VERSION" ]] || { echo 'Node installation version check failed.' >&2; exit 1; }
[[ "$(pnpm --version)" == "$PNPM_VERSION" ]] || { echo 'pnpm installation version check failed.' >&2; exit 1; }
[[ "$(pm2 --version)" == "$PM2_VERSION" ]] || { echo 'PM2 installation version check failed.' >&2; exit 1; }
node --version
pnpm --version
pm2 --version
docker --version
docker compose version
nginx -v
echo 'Host tools installed. Log out/in for ubuntu Docker group membership to take effect.'
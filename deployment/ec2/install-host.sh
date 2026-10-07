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

export DEBIAN_FRONTEND=noninteractive
apt-get -o Acquire::Retries=5 -o DPkg::Lock::Timeout=120 update
apt-get -o Acquire::Retries=5 -o DPkg::Lock::Timeout=120 install -y \
  ca-certificates curl gnupg nginx util-linux

install -m 0755 -d /etc/apt/keyrings
curl --fail --silent --show-error --retry 5 \
  https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
printf 'deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu noble stable\n' \
  > /etc/apt/sources.list.d/docker.list

curl --fail --silent --show-error --retry 5 \
  https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
  | gpg --dearmor --yes -o /etc/apt/keyrings/nodesource.gpg
chmod a+r /etc/apt/keyrings/nodesource.gpg
printf 'deb [arch=amd64 signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_24.x nodistro main\n' \
  > /etc/apt/sources.list.d/nodesource.list

apt-get -o Acquire::Retries=5 -o DPkg::Lock::Timeout=120 update
apt-get -o Acquire::Retries=5 -o DPkg::Lock::Timeout=120 install -y \
  docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin nodejs
npm install --global pnpm@11.12.0 pm2
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

node --version
pnpm --version
pm2 --version
docker --version
docker compose version
nginx -v
echo 'Host tools installed. Log out/in for ubuntu Docker group membership to take effect.'
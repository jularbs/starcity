# Manual PM2 deployment to EC2

This manual UAT path runs API, manage, and web on Ubuntu under PM2. Docker Compose runs only test MongoDB and turnstile MySQL. Email uses your remote SMTP provider. This is separate from GitHub Actions/ECR; use only one deployment method per host.

## 1. Prepare the host

Use Ubuntu 24.04 x86-64 in Singapore. `t3.medium` (2 vCPU, 4 GiB RAM) is a starting point for 2-3 UAT testers; local builds can briefly use more memory. Use encrypted storage with room for Docker database volumes, workspace dependencies, and Next.js build output.

Allow inbound HTTPS only from Cloudflare's current IP ranges. Do not expose SSH, ports 3000-3001, 8000, 27017, 3306, 1025, or 8025. Use SSM for administration. The host needs outbound HTTPS to GitHub, NodeSource, Docker's package repository, npm/pnpm registries, your UAT S3 bucket, the SMTP provider, and PayMaya sandbox.

You do **not** need to create or download an EC2 SSH key pair for Session
Manager. Attach an instance profile with `AmazonSSMManagedInstanceCore` when
launching the instance. Your human IAM Identity Center/user role separately
needs permission to start/resume/terminate sessions and describe the target.
The SSM Agent must be installed, running, and able to make outbound HTTPS
connections to AWS Systems Manager.

Use an AWS-published Ubuntu 24.04 AMI with SSM Agent preinstalled, or provide
this EC2 **launch-time user data** so Session Manager works before you run the
host installer:

```bash
#!/bin/bash
set -eu
region=ap-southeast-1
if command -v snap >/dev/null 2>&1 && snap list amazon-ssm-agent >/dev/null 2>&1; then
  snap start --enable amazon-ssm-agent
  systemctl enable --now snap.amazon-ssm-agent.amazon-ssm-agent.service
else
  curl --fail --silent --show-error --retry 5 \
    "https://s3.$region.amazonaws.com/amazon-ssm-$region/latest/debian_amd64/amazon-ssm-agent.deb" \
    -o /tmp/amazon-ssm-agent.deb
  dpkg -i /tmp/amazon-ssm-agent.deb
  rm -f /tmp/amazon-ssm-agent.deb
  systemctl enable --now amazon-ssm-agent.service
fi
```

Wait until Systems Manager reports the instance **Online**. The installer also
installs/enables SSM Agent, but it must be run after you have connected; it
cannot establish the initial Session Manager connection by itself.

The installer is part of the repository, so clone the repository in step 2
before running it. For the initial clone, make sure Git is available first:

```sh
sudo apt-get update
sudo apt-get install -y git
```

After completing step 2, run the installer by absolute path from any directory:

```sh
sudo bash /opt/starcity/app/deployment/ec2/install-host.sh
```

It installs Git, the exact Node version recorded in the repository's `.nvmrc`
(currently 24.22.1), pnpm 11.12.0, PM2 6.0.14, Docker/Compose, Nginx, and SSM
Agent. Node is downloaded from nodejs.org and SHA-256 verified before install;
the installer refuses an unrecognized `.nvmrc` version until its verified
archive checksum is deliberately updated. The Ubuntu `ubuntu` account is added
to the Docker group; reconnect your SSM session before using Docker as `ubuntu`.
When intentionally changing `.nvmrc`, update the version and official Linux
x64 checksum together in `install-host.sh`, run the host installer, then deploy.

Create directories:

```sh
sudo install -d -o ubuntu -g ubuntu -m 0750 /opt/starcity/app /opt/starcity/shared
sudo install -d -o root -g root -m 0700 /opt/starcity/shared/tls
```

## 2. Clone the repository

For a private repository, create a dedicated read-only deploy key on EC2 and add only its public key to GitHub's repository Deploy Keys. Verify GitHub's SSH host fingerprint from a trusted source. Configure `/home/ubuntu/.ssh/config`:

```sshconfig
Host github-starcity-uat
  HostName github.com
  User git
  IdentityFile ~/.ssh/starcity-uat-readonly
  IdentitiesOnly yes
```

Clone only `develop` as `ubuntu`:

```sh
sudo -iu ubuntu git clone --branch develop --single-branch \
  git@github-starcity-uat:jularbs/starcity.git /opt/starcity/app
```

Never put the private deploy key in the repository, shell history, PM2 configuration, or chat. For a public repository, use its read-only HTTPS URL instead.

## 3. Configure runtime credentials

Create a private env file outside the repository:

```sh
sudo install -o ubuntu -g ubuntu -m 0600 /dev/null /opt/starcity/shared/runtime.env
sudo -iu ubuntu nano /opt/starcity/shared/runtime.env
```

Use [runtime.env.example](runtime.env.example) as the key checklist. The deploy script sources this as a shell-compatible env file, and Docker Compose also reads it. Keep values one line each and quote values with special characters. Never commit or print the completed env file.

Use separate random values for MongoDB, MySQL, JWT, and MFA encryption. Hex passwords are URI-safe for the MongoDB URL. Generate `MFA_ENCRYPTION_KEY` with `openssl rand -base64 32`; back it up securely and keep it stable for enrolled users.

Set a UAT-only S3 bucket/key because the API checks S3 during startup and exits if access fails. Configure remote SMTP host, username, app password, and TLS mode:

| SMTP mode    | `EMAIL_PORT` | `EMAIL_SECURE` |
| ------------ | -----------: | -------------- |
| Implicit TLS |          465 | true           |
| STARTTLS     |          587 | false          |

Use your provider's actual settings. SMTP TLS certificate verification is enabled; install/use the correct CA chain rather than disabling verification. Use a UAT-only sender and tester-recipient allowlist. Do not use production SMTP credentials. PayMaya must use sandbox credentials; keep turnstile sync disabled until it is safe to test.

## 4. Start test databases

Run as `ubuntu` after filling the env file:

```sh
sudo -iu ubuntu bash -lc 'cd /opt/starcity/app && bash deployment/ec2/start-dependencies.sh'
```

MongoDB and test turnstile MySQL use named Docker volumes and loopback-only published ports. MySQL runs the repository's test schema. Initializer SQL runs only when the volume is empty; changing env-file passwords does not rotate existing database users. Never run `docker compose down -v` to fix a deployment issue.

## 5. Configure Cloudflare TLS and Nginx

Create proxied Cloudflare A records for `uat.starcity.com.ph`, `uat-manage.starcity.com.ph`, and `uat-api.starcity.com.ph`, all pointing to the EC2 Elastic IP. Set SSL/TLS to **Full (strict)**. Restrict origin port 443 to Cloudflare IP ranges because the API trusts `CF-Connecting-IP`.

Create an Origin Certificate for those hosts in Cloudflare. You can enter its
certificate and private key directly into files in your active SSM shell; this
does not require Secrets Manager or SSH. First check your organization's SSM
Session Manager preferences: if session input/transcripts are recorded to
CloudWatch Logs or S3, a pasted private key may be captured there. If so, use
your approved secret-transfer method instead. Do not paste the key into chat,
Git, or a command argument.

```sh
sudo tee /opt/starcity/shared/tls/fullchain.pem >/dev/null <<'STAR_CITY_CERT'
PASTE THE ENTIRE CLOUDFLARE CERTIFICATE HERE, INCLUDING ITS BEGIN/END LINES
STAR_CITY_CERT

sudo tee /opt/starcity/shared/tls/privkey.pem >/dev/null <<'STAR_CITY_KEY'
PASTE THE ENTIRE MATCHING PRIVATE KEY HERE, INCLUDING ITS BEGIN/END LINES
STAR_CITY_KEY

sudo chown root:root /opt/starcity/shared/tls/fullchain.pem /opt/starcity/shared/tls/privkey.pem
sudo chmod 0644 /opt/starcity/shared/tls/fullchain.pem
sudo chmod 0600 /opt/starcity/shared/tls/privkey.pem
cert_public_key=$(sudo openssl x509 -in /opt/starcity/shared/tls/fullchain.pem -pubkey -noout | openssl pkey -pubin -outform DER | sha256sum | cut -d' ' -f1)
private_public_key=$(sudo openssl pkey -in /opt/starcity/shared/tls/privkey.pem -pubout -outform DER | sha256sum | cut -d' ' -f1)
test "$cert_public_key" = "$private_public_key" && echo 'Certificate and private key match.'

sudo install -o root -g root -m 0644 /opt/starcity/app/deployment/ec2/nginx-uat.conf /etc/nginx/sites-available/starcity-uat
sudo ln -sfn /etc/nginx/sites-available/starcity-uat /etc/nginx/sites-enabled/starcity-uat
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
```

Inspect and disable the default Nginx site only if it conflicts. Do not cache API, auth, webhook, dashboard, or personalized ticket responses. Do not challenge payment callbacks.

## 6. Build and start with PM2

Run as non-root `ubuntu`:

```sh
sudo -iu ubuntu bash -lc 'cd /opt/starcity/app && bash deployment/ec2/deploy.sh'
```

The deploy script validates exact Node, pnpm, and PM2 versions before changing
anything. It links the protected env file to the ignored `apps/api/.env`,
starts/waits for databases, installs the frozen workspace lockfile, builds
API/manage/web, replaces staged Next.js standalone assets, and reloads PM2.
The deploy passes its verified Node executable to each PM2 app explicitly, so
the applications use the pinned runtime even if the PM2 daemon was started by
another Node installation. Repeated deploys replace static/public assets
rather than nesting stale copies. Verify runtime processes with:

```sh
for app in starcity-api starcity-manage starcity-web; do
  pid=$(pm2 pid "$app")
  printf '%s: ' "$app"
  readlink -f "/proc/$pid/exe"
done
```

Each path should resolve under `/opt/node-v24.22.1/bin/node`.
`NEXT_PUBLIC_*` values are compiled into the Next.js builds; rerun deploy after
changing public URLs. API, manage, and web listen on loopback ports 8000, 3000,
and 3001; Nginx is the only public entry point.

Check local health and logs:

```sh
sudo -iu ubuntu pm2 status
sudo -iu ubuntu pm2 logs --lines 100
curl -i http://127.0.0.1:8000/healthz
curl -I http://127.0.0.1:3000/auth/login
curl -I http://127.0.0.1:3001/robots.txt
```

Enable PM2 resurrection after reboot once:

```sh
sudo -iu ubuntu pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

Run the exact privileged `sudo env PATH=... pm2 startup ...` command printed by PM2, then:

```sh
sudo -iu ubuntu pm2 save
```

Check public access through Cloudflare:

```sh
curl -i https://uat-api.starcity.com.ph/healthz
curl -I https://uat-manage.starcity.com.ph/auth/login
curl -I https://uat.starcity.com.ph/robots.txt
```

## 7. Update and test

After reviewing/pushing a commit to `develop`, deploy it as `ubuntu`:

```sh
sudo -iu ubuntu bash -lc 'cd /opt/starcity/app && bash deployment/ec2/update-develop.sh'
```

The update script refuses a dirty checkout, fast-forward pulls `origin/develop`, and runs the same build/health checks. Builds happen on EC2 and can use significant memory. PM2 reload causes brief downtime. Keep one API process because cron runs in-process; avoid deployment during payment tests.

There is no default admin. Sign up one synthetic test user through manage
registration. Signup creates an inactive account, so bootstrap approval once as
described in [the next section](#bootstrap-the-first-uat-admin). Enroll MFA
before normal manage use. Test S3 uploads, SMTP to the allowlisted tester,
sandbox payment callbacks, and MySQL writes. This deployment sends real messages
through your remote SMTP provider, so verify recipient restrictions before
testing.

## Bootstrap the first UAT admin

This is a one-time out-of-band bootstrap for an empty test database, performed
by an authorized EC2 operator. Register the intended test admin first. In an
Ubuntu/SSM session, connect to the local Compose MongoDB root account:

```sh
cd /opt/starcity/app
docker compose --project-name starcity-local-dependencies \
  --env-file /opt/starcity/shared/runtime.env \
  -f deployment/ec2/compose.dependencies.yaml exec mongodb sh -lc \
  'exec mongosh --quiet --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin starcity_uat'
```

In `mongosh`, verify there is exactly one matching synthetic test account,
substituting its registered email:

```js
db.users.findOne(
  { email: 'YOUR_TEST_ADMIN_EMAIL', deletedAt: null },
  { _id: 1, email: 1, status: 1, department: 1 },
);
db.users.updateOne(
  { email: 'YOUR_TEST_ADMIN_EMAIL', deletedAt: null },
  { $set: { status: true, department: 'admin', mistakes: 0 } },
);
```

Do not change its password hash or MFA fields, approve unknown accounts, or use
this as routine recovery. Record this one-time bootstrap in your UAT change log.
Sign in through manage and complete required MFA enrollment afterward.

Do not operate the ECR/SSM deployment workflow and PM2 against this same host. They would compete over ports, process ownership, and application versions.

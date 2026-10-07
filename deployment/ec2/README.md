# Manual PM2 deployment to EC2

This manual UAT path runs API, manage, and web on Ubuntu under PM2. Docker Compose runs only test MongoDB and turnstile MySQL. Email uses your remote SMTP provider. This is separate from GitHub Actions/ECR; use only one deployment method per host.

## 1. Prepare the host

Use Ubuntu 24.04 x86-64 in Singapore. `t3.medium` (2 vCPU, 4 GiB RAM) is a starting point for 2-3 UAT testers; local builds can briefly use more memory. Use encrypted storage with room for Docker database volumes, workspace dependencies, and Next.js build output.

Allow inbound HTTPS only from Cloudflare's current IP ranges. Do not expose SSH, ports 3000-3001, 8000, 27017, 3306, 1025, or 8025. Use SSM for administration. The host needs outbound HTTPS to GitHub, NodeSource, Docker's package repository, npm/pnpm registries, your UAT S3 bucket, the SMTP provider, and PayMaya sandbox.

Run the host installer as root:

```sh
sudo bash deployment/ec2/install-host.sh
```

It installs Node 24, pnpm 11.12.0, PM2, Docker/Compose, and Nginx. The Ubuntu `ubuntu` account is added to the Docker group; reconnect your SSM session before using Docker as that user.

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

Clone only `develop`:

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

Create an Origin Certificate for those hosts and transfer it directly to EC2 through an approved secure method, not through Git or chat. Install it:

```sh
sudo install -o root -g root -m 0600 /secure/path/fullchain.pem /opt/starcity/shared/tls/fullchain.pem
sudo install -o root -g root -m 0600 /secure/path/privkey.pem /opt/starcity/shared/tls/privkey.pem
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

The deploy script validates prerequisites, links the protected env file to the ignored `apps/api/.env`, starts/waits for databases, installs the frozen workspace lockfile, builds API/manage/web, stages Next.js standalone assets, and reloads PM2. `NEXT_PUBLIC_*` values are compiled into the Next.js builds; rerun deploy after changing public URLs. API, manage, and web listen on loopback ports 8000, 3000, and 3001; Nginx is the only public entry point.

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

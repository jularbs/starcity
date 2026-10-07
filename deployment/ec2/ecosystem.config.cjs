const path = require('node:path');

const appRoot =
  process.env.STARCITY_APP_ROOT || path.resolve(__dirname, '../..');

const app = (name, cwd, script, port) => ({
  name: `starcity-${name}`,
  cwd,
  script,
  interpreter: 'node',
  exec_mode: 'fork',
  instances: 1,
  autorestart: true,
  max_restarts: 10,
  min_uptime: '10s',
  restart_delay: 3000,
  kill_timeout: 15000,
  time: true,
  env: {
    NODE_ENV: 'production',
    PORT: String(port),
    HOSTNAME: '127.0.0.1',
    NEXT_TELEMETRY_DISABLED: '1',
  },
});

module.exports = {
  apps: [
    app(
      'api',
      path.join(appRoot, 'apps/api'),
      path.join(appRoot, 'apps/api/dist/server.js'),
      8000,
    ),
    app(
      'manage',
      path.join(appRoot, 'apps/manage/.next/standalone/apps/manage'),
      'server.js',
      3000,
    ),
    app(
      'web',
      path.join(appRoot, 'apps/web/.next/standalone/apps/web'),
      'server.js',
      3001,
    ),
  ],
};

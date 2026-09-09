import {
  connectMongoDB,
  disconnectMongoDB,
  syncModelIndexes,
} from './database/mongodb/index.js';
import app from './app.js';
import {
  closeMySqlPool,
  verifyMySqlConnection,
} from './database/mysql/mysql2.js';

import { verifyEmailServer } from './modules/email/email.service.js';
import { startCronJobs } from './common/cron/cronScheduler.js';
import { config } from './config/index.js';
import User from './modules/user/user.model.js';

const port = config.app.port;

const startServer = async () => {
  await connectMongoDB();
  await verifyMySqlConnection();
  await syncModelIndexes(User);
  await verifyEmailServer();
  startCronJobs();

  const server = app.listen(port, () => {
    console.log(`Environment is ${config.app.env}`);
    console.log(`Server is running on port ${port}`);
  });

  let isShuttingDown = false;

  const shutdown = (signal) => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    console.log(`${signal} received; shutting down`);
    const forceExitTimer = setTimeout(() => process.exit(1), 10000);
    forceExitTimer.unref();

    server.close(() => {
      disconnectMongoDB().finally(() => process.exit(0));
      closeMySqlPool().finally(() => process.exit(0));
    });
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
};

startServer().catch((error) => {
  console.error('Unable to start server:', error);
  process.exit(1);
});

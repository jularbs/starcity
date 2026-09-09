import {
  connectMongoDB,
  disconnectMongoDB,
  syncModelIndexes,
} from './database/mongodb/index.js';
import { verifyS3Connection } from './common/object-storage/amazon-s3.js';
import app from './app.js';
import {
  closeMySqlPool,
  verifyMySqlConnection,
} from './database/mysql/index.js';

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
  await verifyS3Connection();
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

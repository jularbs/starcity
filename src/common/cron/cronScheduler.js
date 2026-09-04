import cron from 'node-cron';
import {
  cronSyncAP,
  cronProcessEmailQueues,
  cronSyncSMTickets,
  dbcleanup,
  generateDailyReport,
  generateQRdeliveryReport,
} from './cronjobs.js';
import { config } from '../../config/index.js';

let isStarted = false;

const runJob = (job, name) => {
  Promise.resolve(job()).catch((error) => {
    console.error(`Cron job failed (${name}):`, error);
  });
};

export const startCronJobs = () => {
  if (isStarted) {
    return;
  }

  isStarted = true;

  cron.schedule('*/15 * * * *', () => {
    if (config.app.isProduction) {
      runJob(cronSyncSMTickets, 'sync SM tickets');
      runJob(cronSyncAP, 'sync access passes');
    }
  });

  cron.schedule('*/5 * * * *', () => {
    if (config.app.isProduction) {
      runJob(cronProcessEmailQueues, 'process email queues');
    }
  });

  cron.schedule('0 0 * * *', () => {
    if (config.app.isProduction) {
      runJob(dbcleanup, 'database cleanup');
    }
  });

  cron.schedule('5 16 * * *', () => {
    if (config.app.isProduction) {
      runJob(generateDailyReport, 'generate daily report');
      runJob(generateQRdeliveryReport, 'generate QR delivery report');
    }
  });
};

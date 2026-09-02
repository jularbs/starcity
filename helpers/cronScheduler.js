import cron from "node-cron";
import {
    cronSyncAP,
    cronProcessEmailQueues,
    cronSyncSMTickets,
    dbcleanup,
    generateDailyReport,
    generateQRdeliveryReport,
} from "./cronjobs.js";

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

    cron.schedule("*/15 * * * *", () => {
        if (process.env.NODE_ENV === "production") {
            runJob(cronSyncSMTickets, "sync SM tickets");
            runJob(cronSyncAP, "sync access passes");
        }
    });

    cron.schedule("*/5 * * * *", () => {
        if (process.env.NODE_ENV === "production") {
            runJob(cronProcessEmailQueues, "process email queues");
        }
    });

    cron.schedule("0 0 * * *", () => {
        if (process.env.NODE_ENV === "production") {
            runJob(dbcleanup, "database cleanup");
        }
    });

    cron.schedule("5 16 * * *", () => {
        if (process.env.NODE_ENV === "production") {
            runJob(generateDailyReport, "generate daily report");
            runJob(generateQRdeliveryReport, "generate QR delivery report");
        }
    });
};
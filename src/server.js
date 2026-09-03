import dotenv from "dotenv";
import { connectMongoDB, disconnectMongoDB } from "./database/mongodb/index.js";
import app from "./app.js";
import { startCronJobs } from "./common/cron/cronScheduler.js";

dotenv.config();

const port = process.env.PORT || 8000;

const startServer = async () => {
  await connectMongoDB();
  startCronJobs();

  const server = app.listen(port, () => {
    console.log(`Environment is ${process.env.NODE_ENV}`);
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
    });
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
};

startServer().catch((error) => {
  console.error("Unable to start server:", error);
  process.exit(1);
});

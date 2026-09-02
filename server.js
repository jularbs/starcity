import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createRateLimiter, catchAllLimiter } from "./common/middleware/rate-limit.middleware.js";
import dotenv from "dotenv";
dotenv.config();
import { connectMongoDB, disconnectMongoDB } from "./database/mongodb/index.js";

//routes
import rideCategoryRoutes from "./modules/rideCategory/rideCategory.routes.js";
import rideRoutes from "./modules/ride/ride.routes.js";
import ticketRoutes from "./modules/ticket/ticket.routes.js";
import paymentOptionRoutes from "./modules/paymentOption/paymentOption.routes.js";
import optionRoutes from "./modules/option/option.routes.js";
import saleRoutes from "./modules/sale/sale.routes.js";
import accessPassRoutes from "./modules/accessPass/accessPass.routes.js";
import postRoutes from "./modules/post/post.routes.js";
import imageSliderRoutes from "./modules/imageSlider/imageSlider.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import bannerRoutes from "./modules/banner/banner.routes.js";
import mediaRoutes from "./modules/media/media.routes.js";
import webhookRoutes from "./modules/webhooks/webhooks.routes.js";
import promoRoutes from "./modules/promo/promo.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import auditTrailRoutes from "./modules/auditTrail/auditTrail.routes.js";

import { startCronJobs } from "./helpers/cronScheduler.js";

const app = express();

// Only trust the first hop (Cloudflare/your reverse proxy) so req.ip and
// X-Forwarded-For based IP resolution can't be spoofed by the client itself.
app.set("trust proxy", 1);

var allowedDomains = JSON.parse(process.env.CORS_DOMAINS);
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedDomains.indexOf(origin) === -1) {
        var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization", "Origin"],
  })
);

//middlewares
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cookieParser());

//urlencoded
app.use(express.urlencoded({ extended: true }));

//use routes
app.use("/api", rideCategoryRoutes);
app.use("/api", rideRoutes);
app.use("/api", ticketRoutes);
app.use("/api", paymentOptionRoutes);
app.use("/api", optionRoutes);
app.use("/api", saleRoutes);
app.use("/api", accessPassRoutes);
app.use("/api", postRoutes);
app.use("/api", imageSliderRoutes);
app.use("/api", authRoutes);
app.use("/api", bannerRoutes);
app.use("/api", mediaRoutes);
app.use("/api", promoRoutes);
app.use("/api", userRoutes);
app.use("/api", auditTrailRoutes);
app.use("/webhooks", webhookRoutes);

//Rate Limiting 404 requests
app.use(catchAllLimiter());

app.use((req, res, next) => {
  res.status(404).json({
    error: "Resource Not Found",
  });
});

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

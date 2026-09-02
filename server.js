const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

require("dotenv").config();
mongoose.set("strictQuery", true);

//routes
const rideCategoryRoutes = require("./modules/rideCategory/rideCategory.routes");
const rideRoutes = require("./modules/ride/ride.routes");
const ticketRoutes = require("./modules/ticket/ticket.routes");
const paymentOptionRoutes = require("./modules/paymentOption/paymentOption.routes");
const optionRoutes = require("./modules/option/option.routes");
const saleRoutes = require("./modules/sale/sale.routes");
const accessPassRoutes = require("./modules/accessPass/accessPass.routes");
const postRoutes = require("./modules/post/post.routes");
const imageSliderRoutes = require("./modules/imageSlider/imageSlider.routes");
const authRoutes = require("./modules/auth/auth.routes");
const bannerRoutes = require("./modules/banner/banner.routes");
const mediaRoutes = require("./modules/media/media.routes");
const webhookRoutes = require("./modules/webhooks/webhooks.routes");
const promoRoutes = require("./modules/promo/promo.routes");

var cron = require("node-cron");

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

mongoose
  .connect(process.env.DB_CONNECTION_STRING)
  .then(() => console.log(`DB connected`))
  .catch((error) => console.log("Error in connecting to DB: " + error));

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
app.use("/webhooks", webhookRoutes);

app.use(express.static(__dirname + "/data/img"));

//Rate Limiting 404 requests
const CatchAllLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: "Too many failed 404 requests from this IP, please try again after 15 minutes",
  },
  // cf-connecting-ip is only trustworthy if the origin is unreachable except via
  // Cloudflare (firewall rules / Authenticated Origin Pulls); otherwise it's spoofable.
  // ipKeyGenerator normalizes IPv6 addresses to a subnet so rate limits can't be
  // trivially bypassed by rotating within the same /64.
  keyGenerator: (req) => ipKeyGenerator(req.headers["cf-connecting-ip"] || req.ip),
});
app.use(CatchAllLimiter);

app.use((req, res, next) => {
  res.status(404).json({
    error: "Resource Not Found",
  });
});

const {
  cronSyncAP,
  cronProcessEmailQueues,
  cronSyncSMTickets,
  dbcleanup,
  generateDailyReport,
  generateQRdeliveryReport
} = require("./helpers/cronjobs");

// cron jobs
cron.schedule("*/15 * * * *", function () {
  //Execute only on production
  if (process.env.NODE_ENV == "production") {
    cronSyncSMTickets();
    cronSyncAP();
  }
});

cron.schedule("*/5 * * * *", function () {
  //Execute only on production
  if (process.env.NODE_ENV == "production") {
    cronProcessEmailQueues();
  }
});

cron.schedule("0 0 * * *", function () {
  //Execute only on production
  if (process.env.NODE_ENV == "production") {
    dbcleanup();
  }
});

cron.schedule("5 16 * * *", function () { //UTC for 00:05
  //Execute only on production
  if (process.env.NODE_ENV == "production") {
    generateDailyReport();
    generateQRdeliveryReport();
  }
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Environment is ${process.env.NODE_ENV}`);
  console.log(`Server is running on port ${port}`);
});

const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();
mongoose.set("strictQuery", true);

//routes
const rideCategoryRoutes = require("./routes/rideCategory");
const rideRoutes = require("./routes/ride");
const ticketRoutes = require("./routes/ticket");
const paymentOptionRoutes = require("./routes/paymentOption");
const optionRoutes = require("./routes/option");
const saleRoutes = require("./routes/sale");
const accessPassRoutes = require("./routes/accessPass");
const postRoutes = require("./routes/post");
const imageSliderRoutes = require("./routes/imageSlider");
const authRoutes = require("./routes/auth");
const bannerRoutes = require("./routes/banner");
const mediaRoutes = require("./routes/media");
const webhookRoutes = require("./routes/webhooks");
const promoRoutes = require("./routes/promo");

var cron = require("node-cron");

const app = express();

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
app.use(morgan("dev"));
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

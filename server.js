const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

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
const healthDeclarationRoutes = require("./routes/healthDeclaration");
const mediaRoutes = require("./routes/media");
const webhookRoutes = require("./routes/webhooks");

var cron = require("node-cron");

const { cronSyncAP } = require("./helpers/cronjobs");
const app = express();

var allowedDomains = [
  "http://jularbs.com:3000",
  "https://jularbs.com:3000", 
  "http://starcity.com.ph",
  "https://starcity.com.ph",
  "http://www.starcity.com.ph",
  "https://www.starcity.com.ph",
  "http://uat.starcity.com.ph",
  "https://uat.starcity.com.ph",
];

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

//DATABASE CONNECTIONS
let cmsDatabase = "";
if (process.env.NODE_ENV === "production") {
  cmsDatabase = process.env.DATABASE_PROD;
} else {
  cmsDatabase = process.env.DATABASE_DEV;
}

mongoose
  .connect(cmsDatabase, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`DB connected at ${cmsDatabase}`))
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
app.use("/api", healthDeclarationRoutes);
app.use("/api", mediaRoutes);
app.use("/webhooks", webhookRoutes);

app.use(express.static(__dirname + "/data/img"));

//cron jobs
cron.schedule("*/30 * * * *", function () {
  cronSyncAP();
});

//port
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Environment is ${process.env.NODE_ENV}`);
  console.log(`Server is running on port ${port}`);
});

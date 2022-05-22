const Sale = require("../models/sale");
const Ticket = require("../models/ticket");
const AccessPass = require("../models/accessPass");
const AccessPassQueue = require("../models/accessPassQueue");
const Option = require("../models/option");
const crypto = require("crypto");
const QRCode = require("qrcode");
const { uploadBase64 } = require("../helpers/s3uploader");
const mongoose = require("mongoose");
const { sendMail } = require("../helpers/nodemailer");
const { accessPassEmailNotification } = require("../helpers/emailTemplates");
const { pool } = require("../lib/mysql/connect");

const { format } = require("date-fns");
const moment = require("moment");
const axios = require("axios");

const { forceSync } = require("../helpers/cronjobs");

const EmailQueue = require("../models/emailQueue");
const { cronProcessEmailQueues } = require("../helpers/cronjobs");

//HELPERS
exports.getCurrentTicketPrice = (ticket) => {
  return new Promise((resolve, reject) => {
    const { ticketId } = ticket;
    Ticket.findOne({ _id: new mongoose.Types.ObjectId(`${ticketId}`) }).exec(
      (err, result) => {
        if (err) reject(err);
        return resolve({ price: result.price });
      }
    );
  });
};

exports.asyncGetTicketPrice = async (ticket) => {
  return this.getCurrentTicketPrice(ticket);
};

exports.calculateCartItem = (item) => {
  return new Promise((resolve, reject) => {
    const { ticketId, qty } = item;
    Ticket.findOne({ _id: ticketId }).exec((err, result) => {
      if (err) reject(err);
      return resolve({ amount: qty * result.price });
    });
  });
};

exports.calculateCart = (cartItems) => {
  return Promise.all(cartItems.map((item) => this.calculateCartItem(item)));
};

exports.generateAccessPass = (sale, accessPasses) => {
  accessPasses.map(async (ap) => {
    let isExisting = [];
    let finalToken = "";

    //get ticketDetails
    const ticket = await Ticket.findOne({
      _id: ap.ticketId,
    }).exec();

    for (let i = 0; i < ap.qty; i++) {
      //check for dupes
      do {
        finalToken = `W-${ticket.itemCode}-${crypto
          .randomBytes(4)
          .toString("hex")}`;

        finalToken.toUpperCase();
        isExisting = await AccessPass.find({
          accessToken: finalToken,
        }).exec();
      } while (isExisting.length !== 0);

      let base64 = await QRCode.toDataURL(finalToken, {
        version: 4,
        errorCorrectionLevel: "H",
        type: "image/jpeg",
        quality: 1,
        margin: 5,
        width: 300,
        height: 300,
      });

      var date = new Date();
      var month = date.getUTCMonth() + 1; //months from 1-12
      var year = date.getUTCFullYear();

      const upload = await uploadBase64(
        await base64,
        `access-pass/${year}/${month}/${sale.customerName}/${sale.refId}/${finalToken}`
      );

      //save data to accesspassmodel
      let accessPass = new AccessPass();
      accessPass.ticketId = ap.ticketId;
      accessPass.salesId = sale._id;
      accessPass.accessToken = finalToken;
      accessPass.QRcode = await upload;

      accessPass.save(async (err, result) => {
        if (err) console.log("FAILED TO SAVE TOKEN IN DATABASE: ", finalToken);
        const syncResult = await this.syncAccessPass(result, ticket.itemCode);
        console.log(`Processing ${finalToken}: `, syncResult);
        console.log(`ACCESS PASS ${finalToken} CREATED`);
      });
    }
  });
};

exports.resendAR = async (req, res) => {
  const { refId } = req.body;

  const isSent = await this.sendAR(refId);

  if (isSent) {
    res.json({ message: "E-mail resent successfully." });
  } else {
    res.json({ message: "E-mail failed. Please try again later." });
  }
};

exports.sendAR = async (refId) => {
  return new Promise(async (resolve, reject) => {
    console.log("SENDING AR FOR ", refId);
    const sale = await Sale.findOne({ refId: refId })
      .populate({
        path: "cartItems",
        populate: {
          path: "ticketId",
          model: "Ticket",
          select: "name -_id",
        },
      })
      .populate({
        path: "paymentDetails",
        populate: {
          path: "option",
          model: "PaymentOption",
          select: "name -_id",
        },
      })
      .exec();

    const saleId = sale._id;

    const accessPasses = await AccessPass.find({ salesId: saleId })
      .populate("ticketId", "slug")
      .select("ticketId accessToken QRcode")
      .exec();

    // const APattachments = accessPasses.map((item, key) => {
    //   return {
    //     filename: `${key + 1}-${item.ticketId.slug}-${item.accessToken}.jpeg`,
    //     path: `${process.env.DOMAIN}api/v1/media?key=${item.QRcode.key}&bucket=${item.QRcode.bucket}`,
    //   };
    // });

    const details = {
      to: sale.emailAddress,
      from: process.env.EMAIL_ADDRESS,
      subject:
        "Your acknowledgement receipt for your Star City ticket purchase",
      html: accessPassEmailNotification(sale),
      bcc: ["accounting@starcity.com.ph", "pallingayan.mario@starcity.com.ph"],
      // attachments: [
      // {
      //   filename: "healthdeclaration-form.pdf",
      //   path: `${process.env.DOMAIN}health-declaration-form.pdf`,
      // },
      // ...APattachments,
      // ],
    };

    try {
      sendMail(details).then((info) => {
        console.log("EMAIL STACK: ", info);
        //check info if undefined
        if (info === undefined) {
          console.log("EMAIL SENT FAILED");
          //add to email queue
          let q = new EmailQueue();
          q.refId = refId;
          q.save((err, result) => {
            if (err) {
              console.log("ERROR IN QUEUEING EMAIL: ", err);
            } else {
              console.log("QUEUE CREATED FOR REF ID: ", refId);
            }
          });
          resolve(false);
        } else {
          console.log("EMAIL SENT SUCCESSFULLY");
          resolve(true);
        }
      });
    } catch (e) {
      console.log("ERROR IN MAILER: ", e);
      console.log("EMAIL SENT FAILED");
      resolve(false);
    }
  });
};

exports.addToQueue = (accessPass, status) => {
  let q = new AccessPassQueue();
  q.accessPass = accessPass._id;
  q.status = status;
  q.save((err, result) => {
    if (err) {
      console.log("ERROR IN QUEUEING ACCESS PASS: ", err);
    } else {
      console.log("QUEUE CREATED FOR ACCESS PASS: ", accessPass.accessToken);
    }
  });
};

exports.syncAccessPass = (accessPass, RideCode) => {
  console.log("SYNCING ACCESS PASS: ", accessPass.accessToken);
  return new Promise((resolve, reject) => {
    try {
      pool.getConnection(async (err, connection) => {
        if (err) {
          console.log("ERROR: ", err);
          this.addToQueue(accessPass, "Failed Connection");
          resolve("Failed Connection, added to queue.");
        } else {
          const date = format(accessPass.createdAt, "yyyy-MM-dd");
          const time = format(accessPass.createdAt, "HH:mm:ss");

          const values = [
            [
              accessPass.accessToken,
              "Pop Tag",
              date,
              time,
              "Purchased",
              "web",
              "1",
              RideCode,
            ],
          ];

          const sql =
            "INSERT INTO admission_history (admission_no, type, date, time, status, origin, syncStatus, RideCode) VALUES ?;";

          connection.query(sql, [values], function (error, results, fields) {
            if (error) {
              this.addToQueue(accessPass, "Failed Query");
              resolve("Failed Query, added to queue");
            } else if (results.affectedRows < 1) {
              console.log(
                `UNABLE TO INSERT TO DATABASE ACCESS TOKEN: `,
                accessPass.accessToken
              );
              this.addToQueue(accessPass, "Failed insert");
              resolve("Failed Insert, added to queue");
            } else {
              resolve(`ACCESS PASS SYNCED: ${accessPass.accessToken}`);
            }
          });

          connection.release();
        }
      });
    } catch (e) {
      resolve("ERROR IN MYSQL.");
    }
  });
};

//REQUESTS
exports.sync = async (req, res) => {
  Sale.find({ status: "for sync" })
    .populate({
      path: "cartItems",
      populate: {
        path: "ticketId",
        model: "Ticket",
        select: "name -_id",
      },
    })
    .populate({
      path: "paymentDetails",
      populate: {
        path: "option",
        model: "PaymentOption",
        select: "name -_id",
      },
    })
    .select(
      "customerName cartItems orderTotal paymentDetails refId created_at -_id"
    )
    .exec(async (err, data) => {
      if (err) res.json({ error: "Failed to synchronize", message: err });
      await Sale.updateMany(
        { status: "for sync" },
        { status: "synced undelivered" },
        () => {}
      );

      res.json(data);
    });
};

exports.create = async (req, res) => {
  const { name, email, cartItems, paymentDetails } = req.body;

  let isExisting = [];
  let refID = "";

  do {
    refID = crypto.randomBytes(15).toString("hex");
    isExisting = await Sale.find({ refId: refID }).exec();
  } while (isExisting.length !== 0);

  let sale = new Sale();
  sale.customerName = name;
  sale.emailAddress = email;
  sale.refId = refID;
  const cart = await Promise.all(
    cartItems.map(async (item) => {
      const { price } = await this.getCurrentTicketPrice(item);
      return {
        ticketId: item.ticketId,
        qty: item.qty,
        priceAcquired: price,
      };
    })
  );

  sale.cartItems = cart;
  //compute for order total
  sale.orderTotal = await (
    await this.calculateCart(cartItems)
  ).reduce((a, b) => a.amount + b.amount);

  sale.paymentDetails = paymentDetails;

  let base64 = await QRCode.toDataURL(refID, {
    version: 4,
    errorCorrectionLevel: "H",
    type: "image/jpeg",
    quality: 1,
    margin: 5,
    width: 250,
    height: 250,
  });
  sale.QRcode = await uploadBase64(await base64, `qrcode/${name}`);

  sale.save((err, result) => {
    if (err) {
      return res.status(400).json({
        error: "error occured",
        message: err,
      });
    }

    res.json(result);
  });
};

exports.readBySaltRefID = async (req, res) => {
  const saleDetails = await Sale.findOne({
    salt: req.query.salt,
    refId: req.query.refid,
  })
    .select("_id customerName emailAddress contactNumber expiryDate createdAt")
    .exec();

  if (saleDetails == null) res.json({ error: "Invalid Data" });

  const accessPasses = await AccessPass.find({
    salesId: saleDetails._id,
  })
    .populate("ticketId", "name slug -_id")
    .select("ticketId QRcode accessToken -_id")
    .exec();

  res.json({ details: saleDetails, accessPasses });
};

exports.read = (req, res) => {
  Sale.findOne({ refId: req.params.refid })
    .select(
      "customerName emailAddress contactNumber orderTotal refId salt paymentDetails"
    )
    .populate({
      path: "paymentDetails",
      populate: {
        path: "option",
        model: "PaymentOption",
        select: "name",
      },
    })
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "error occured",
          message: err,
        });
      }
      res.json(data);
    });
};

exports.list = (req, res) => {
  const { skip, limit, start, end, search } = req.query;

  //check UTC Formatting when in server
  const startDate = moment(start).startOf("day").toISOString();
  const endDate = moment(end).endOf("day").toISOString();

  Sale.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
    status: {
      $nin: ["awaiting payment", "P", "p"],
    },
    $or: [
      { refId: { $regex: search, $options: "i" } },
      { customerName: { $regex: search, $options: "i" } },
    ],
  })
    .populate({
      path: "cartItems",
      populate: {
        path: "ticketId",
        model: "Ticket",
        select: "name price",
      },
    })
    .populate({
      path: "paymentDetails",
      populate: {
        path: "option",
        model: "PaymentOption",
        select: "name",
      },
    })
    .sort("-createdAt")
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .exec(async (err, data) => {
      if (err) {
        console.log(err);
        return res.status(400).json({
          error: "error occured",
          message: err,
        });
      }
      const count = await Sale.countDocuments({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        status: {
          $nin: ["awaiting payment", "P", "p"],
        },
        $or: [
          { refId: { $regex: search, $options: "i" } },
          { customerName: { $regex: search, $options: "i" } },
        ],
      });
      res.json({ count, data });
    });
};

exports.update = async (req, res) => {
  const { name, slug, description, price, status } = req.body;

  const ticket = await Ticket.findOne({ slug: slug }).exec();

  ticket.name = name;
  ticket.description = description;

  ticket.price = price;
  ticket.status = status;

  ticket.save((err, result) => {
    if (err) {
      return res.status(400).json({
        error: "error occured",
        message: err,
      });
    }
    res.json({ result, status: "success" });
  });
};

exports.remove = async (req, res) => {
  const { slug } = req.body;

  Ticket.findOneAndDelete({ slug }).exec(async (err, result) => {
    if (err) {
      return res.status(400).json({
        error: "error occured",
        message: err,
      });
    }
    res.json({ success: "Ticket deleted successfully" });
  });
};

exports.createCheckout = async (req, res) => {
  const {
    cartItems,
    customerName,
    email,
    contactNumber,
    paymentDetails,
    token,
  } = req.body;

  //CHECK RECAPTCHA
  const captcha = await axios({
    method: "POST",
    url: "https://www.google.com/recaptcha/api/siteverify",
    params: {
      secret: process.env.RECAPTCHA_SECRET_KEY,
      response: token,
    },
  });

  if (!captcha.data.success) {
    res.status(400).json({
      error: "Please prove you are not a robot by checking the checkbox below.",
    });
  } else {
    let isExisting = [];
    let refID = "";

    do {
      refID = crypto.randomBytes(6).toString("hex").toUpperCase();
      isExisting = await Sale.find({ refId: refID }).exec();
    } while (isExisting.length !== 0);

    let sale = new Sale();

    //error when only 1 item in cart
    const items = await Promise.all(
      cartItems.map(async (item) => {
        const price = await this.getCurrentTicketPrice({
          ticketId: item._id,
        });
        return {
          ticketId: item._id,
          qty: item.qty,
          priceAcquired: price.price,
        };
      })
    );

    if (paymentDetails) {
      sale.paymentDetails = {
        option: "",
        referenceNumber: "",
        status: "",
      };
    }

    const expiryOption = await Option.findOne({ name: "TICKET_EXPIRY" }).exec();

    sale.expiryDate = expiryOption.value;
    sale.customerName = customerName;
    sale.emailAddress = email;
    sale.refId = refID;
    sale.contactNumber = contactNumber;
    sale.cartItems = items;
    sale.status = "awaiting payment";
    sale.orderTotal = items.reduce((sum, item) => {
      return sum + item.qty * item.priceAcquired;
    }, 0);

    sale.salt = Math.round(new Date().valueOf() * Math.random()) + "";
    sale.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: "error occured",
          message: err,
        });
      }

      res.json(result);
    });
  }
};

exports.createDragonPayRequest = async (req, res) => {
  const { txnId, amount, email } = req.body;
  const token = Buffer.from(
    `${process.env.DRAGONPAY_MERCH_ID}:${process.env.DRAGONPAY_PW}`,
    "utf8"
  ).toString("base64");

  const dpRequest = await axios({
    method: "POST",
    url: `${process.env.DRAGONPAY_URL}/${txnId}/post`,
    data: {
      Amount: amount.toFixed(2),
      Currency: "PHP",
      Description: "Star City tickets",
      Email: email,
    },
    headers: {
      Authorization: `Basic ${token}`,
    },
  }).catch((error) => {
    console.log(error.response);
  });

  if (dpRequest.data.Status == "S") res.json(dpRequest.data);
};

exports.processPaypalPayment = async (req, res) => {
  const { status, orderId } = req.body;
  const sale = await Sale.findOne({
    "paymentDetails.referenceNumber": orderId,
  }).exec();

  if (sale) {
    sale.status = "success";
    sale.paymentDetails = {
      ...sale.paymentDetails,
      status: status,
    };

    sale.save((err, result) => {
      res.json({ refid: result.refId, payment: result.status });
      if (status == "COMPLETED") {
        this.generateAccessPass(result, result.cartItems);
        this.sendAR(result.refId);
      }
    });
  } else {
    console.log("ERROR NO SALE FOUND");
    res.status(400).json({ error: "Sale undefined" });
  }
};

const isSynced = (ticket) => {
  return new Promise((resolve, reject) => {
    pool.getConnection(async (err, connection) => {
      if (err) {
        reject(err);
      } else {
        const sql = "SELECT * FROM admission_history WHERE admission_no = ?;";
        const values = [[ticket.accessToken]];

        connection.query(sql, [values], function (error, results, fields) {
          if (error) {
            reject("ERROR IN QUERY: isSynced");
          } else if (results.length > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        });

        connection.release();
      }
    });
  });
};

const insertAccessPass = (ticket) => {
  return new Promise((resolve, reject) => {
    isSynced(ticket)
      .then((syncCheck) => {
        if (syncCheck) {
          resolve("Already in Database");
        } else {
          pool.getConnection(async (err, connection) => {
            if (err) {
              reject(err);
            } else {
              const date = format(ticket.createdAt, "yyyy-MM-dd");
              const time = format(ticket.createdAt, "HH:mm:ss");
              const sql =
                "INSERT INTO admission_history (admission_no, type, date, time, status, origin, syncStatus, RideCode) VALUES ?;";
              const values = [
                [
                  ticket.accessToken,
                  "Pop Tag",
                  date,
                  time,
                  "Purchased",
                  "web",
                  "1",
                  ticket.ticketId.itemCode,
                ],
              ];

              connection.query(
                sql,
                [values],
                function (error, results, fields) {
                  if (err) {
                    reject(error);
                  } else if (results.affectedRows > 0) {
                    resolve("Access Pass Synced");
                  } else if (results.length == 0) {
                    reject("Failed to sync");
                  }
                }
              );

              connection.release();
            }
          });
        }
      })
      .catch((e) => {
        reject(e);
      });
  });
};
//TESTER FUNCTION
exports.test = async (req, res) => {

};

exports.forceSync = async (req, res) => {
  const { skip, limit } = req.query;
  forceSync(skip, limit);

  console.log("processing...");

  res.json({ message: "processing" });
};

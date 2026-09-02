import Sale from "./sale.model.js";
import Ticket from "../ticket/ticket.model.js";
import AccessPass from "../accessPass/accessPass.model.js";
import crypto from "crypto";
import QRCode from "qrcode";
import { uploadBase64 } from "../../helpers/s3uploader.js";
import mongoose from "mongoose";
import { sendMail } from "../../helpers/nodemailer.js";
import { accessPassEmailNotification } from "../../helpers/emailTemplates.js";
import { pool } from "../../database/mysql/index.js";
import { add, format, getDay, nextThursday } from "date-fns";
import dateFnsTz from "date-fns-tz";
import moment from "moment";
import axios from "axios";
import { cronSyncAP } from "../../helpers/cronjobs.js";
import { addToQueue } from "../accessPass/accessPassQueue.controller.js";
import EmailQueue from "../email/emailQueue.model.js";
//TEST
import { processPromo } from "../promo/promo.controller.js";
//HELPERS
const { utcToZonedTime } = dateFnsTz;

const getCurrentTicketPrice = (ticket) => {
  return new Promise(async (resolve, reject) => {
    const { ticketId } = ticket;
    const result = await Ticket.findOne({ _id: new mongoose.Types.ObjectId(`${ticketId}`) }).exec();
    if (!result) reject(new Error("Ticket not found"));
    return resolve({ price: result.price });
  });
};

const calculateCartItem = async (item) => {
  return new Promise(async (resolve, reject) => {
    const { ticketId, qty } = item;
    try {
      const result = await Ticket.findOne({ _id: ticketId }).exec();
      return resolve({ amount: qty * result.price });
    } catch (err) {
      reject(err);
    }
  });
};

const calculateCart = (cartItems) => {
  return Promise.all(cartItems.map((item) => calculateCartItem(item)));
};

export const generateAccessPass = (sale, accessPasses) => {
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
      accessPass.expiryDate = `${format(
        new Date(sale.expiryDate),
        "yyyy-LL-dd"
      )} 23:59:59`;

      try {
        const result = await accessPass.save();
        const syncResult = await syncAccessPass(result, ticket.itemCode);
        console.log(`Processing ${finalToken}: `, syncResult);
        console.log(`ACCESS PASS ${finalToken} CREATED`);
      } catch (err) {
        console.log("FAILED TO SAVE TOKEN IN DATABASE: ", finalToken);
      }
    }
  });
};

export const getOpenParkExpiry = () => {
  //adjustable day indices 1 is monday, 2 is tuesday, 3 is wednesday
  const adjustDays = [1, 2, 3];

  const expiryDate = utcToZonedTime(
    add(new Date(), {
      months: 1,
    }),
    "Asia/Manila"
  );

  const dayValue = getDay(expiryDate);

  const inAdjustDays = adjustDays.indexOf(dayValue);
  const shouldAdjust = inAdjustDays >= 0 ? true : false;
  let expiry = null;

  if (shouldAdjust) {
    expiry = format(nextThursday(expiryDate), "MMMM dd, yyyy");
  } else {
    expiry = format(expiryDate, "MMMM dd, yyyy");
  }

  return expiry;
};

export const resendAR = async (req, res) => {
  const { refId } = req.body;

  const isSent = await sendAR(refId);

  if (isSent) {
    res.json({ message: "E-mail resent successfully." });
  } else {
    res.json({ message: "E-mail failed. Please try again later." });
  }
};

export const sendAR = async (refId) => {
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
      bcc: ["accounting@starcity.com.ph"],
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
          q
            .save()
            .then(() => {
              console.log("QUEUE CREATED FOR REF ID: ", refId);
            })
            .catch((err) => {
              console.log("ERROR IN QUEUEING EMAIL: ", err);
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

const syncAccessPass = (accessPass, RideCode) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("Access Pass Syncing is disabled in non-production environments.");
    return;
  }
  console.log("SYNCING ACCESS PASS: ", accessPass.accessToken);
  return new Promise((resolve, reject) => {
    try {
      pool.getConnection(async (err, connection) => {
        if (err) {
          console.log("ERROR: ", err);
          addToQueue(accessPass, "Failed Connection");
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
              accessPass.expiryDate,
            ],
          ];

          const sql =
            "INSERT INTO admission_history (admission_no, type, date, time, status, origin, syncStatus, RideCode, expiration_date) VALUES ?;";

          connection.query(sql, [values], function (error, results, fields) {
            if (error) {
              console.log("UNABLE TO SYNC ACCESSPASS: ", accessPass.accessToken);
              console.log("ERROR MESSAGE: ", error);
              addToQueue(accessPass, "Failed Query");
              resolve("Failed Query, added to queue");
            } else if (results.affectedRows < 1) {
              console.log(
                `UNABLE TO INSERT TO DATABASE ACCESS TOKEN: `,
                accessPass.accessToken
              );
              addToQueue(accessPass, "Failed insert");
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
export const readBySaltRefID = async (req, res) => {
  const saleDetails = await Sale.findOne({
    salt: req.query.salt,
    refId: req.query.refid,
  })
    .select("_id customerName emailAddress contactNumber expiryDate createdAt")
    .exec();

  if (saleDetails == null)
    return res.status(400).json({ error: "Invalid Data" });

  const accessPasses = await AccessPass.find({
    salesId: saleDetails._id,
  })
    .populate("ticketId", "name slug -_id")
    .select("ticketId QRcode accessToken -_id")
    .exec();

  res.json({ details: saleDetails, accessPasses });
};

export const read = async (req, res) => {
  try {
    const data = await Sale.findOne({ refId: req.params.refid })
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
      .exec();
    res.json(data);
  } catch (err) {
    return res.status(400).json({
      error: "error occured",
      message: err,
    });
  }
};

export const list = async (req, res) => {
  const { skip = 0, limit = 10, start, end, search = "" } = req.query;

  //check UTC Formatting when in server
  const startDate = moment(start).toISOString();
  const endDate = moment(end).toISOString();

  console.log("Start Date: ", startDate);
  console.log("End Date: ", endDate);

  const data = await Sale.find({
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
    .exec();

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
};

export const createCheckout = async (req, res) => {
  const {
    cartItems,
    customerName,
    email,
    contactNumber,
    paymentDetails,
    promoCode
  } = req.body;

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
      const price = await getCurrentTicketPrice({
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

  sale.expiryDate = getOpenParkExpiry();
  sale.customerName = customerName;
  sale.emailAddress = email;
  sale.refId = refID;
  sale.contactNumber = contactNumber;
  sale.cartItems = items;
  sale.status = "awaiting payment";

  let transactionAmount = items.reduce((sum, item) => {
    return sum + item.qty * item.priceAcquired;
  }, 0);

  const promo = await processPromo(promoCode, transactionAmount);
  sale.promoCode = promo.promoCode;
  sale.discount = promo.discount;

  sale.orderTotal = transactionAmount - sale.discount;

  sale.salt = Math.round(new Date().valueOf() * Math.random()) + "";
  try {
    const result = await sale.save();
    res.json(result);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: "error occured",
      message: err,
    });
  }
};

//HELPER FUNCTIONS
export const cleanUp = async (req, res) => {
  let previous2Months = new Date();
  previous2Months.setDate(previous2Months.getDate() - 90);

  const accessPassCount = await AccessPass.countDocuments({
    createdAt: { $lte: previous2Months },
  });

  const saleCount = await Sale.countDocuments({
    createdAt: { $lte: previous2Months },
  });

  const deleteAccessPass = await AccessPass.deleteMany({
    createdAt: { $lte: previous2Months },
  });

  const deleteSalesData = await Sale.deleteMany({
    createdAt: { $lte: previous2Months },
  });

  res.json({
    date: format(previous2Months, "PPpp"),
    AccessPassDeletedCount: accessPassCount,
    saleDeletedCount: saleCount,
  });
};

export const regenerateAccessPass = async (req, res) => {
  console.log("Regenerating Access Passes for sale with Reference Number: ", req.params.id);
  if (req.params.id) {
    const sale = await Sale.findOne({ refId: req.params.id }).exec();
    if (sale) {
      console.log("REMOVING OLD ACCESS PASS");
      await AccessPass.deleteMany({ salesId: sale._id }).exec();
      console.log("GENERATING NEW ACCESS PASS");
      generateAccessPass(sale, sale.cartItems);
      return res.json({ status: "Success", action: "Access Passes Regenerated" })
    } else {
      return res.json({ status: "404", message: "Sale transaction not found" })
    }
  } else {
    return res.json({ status: "404", message: "Reference ID not found" })
  }
}

export const resyncSaleByRefId = async (req, res) => {
  console.log("Resyncing Access Passes for sale with Reference Number: ", req.params.id);

  if (req.params.id) {
    const sale = await Sale.findOne({ refId: req.params.id }).exec();
    if (sale) {
      console.log("Getting Access Passes...");
      const accesspasses = await AccessPass.find({ salesId: sale._id }).exec();
      accesspasses.map(async (ap) => {
        //get ticketDetails
        const ticket = await Ticket.findOne({
          _id: ap.ticketId,
        }).exec();
        const syncResult = await syncAccessPass(ap, ticket.itemCode);
        console.log(syncResult);
      });
      return res.json({ status: "Success", action: "Sale Resynced" })
    } else {
      return res.json({ status: "404", message: "Sale transaction not found" })
    }
  }
  return res.json({ status: "404", message: "Reference ID not found" })
}

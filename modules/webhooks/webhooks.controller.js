import Sale from "../sale/sale.model.js";
import SmQueue from "../smTickets/smQueue.model.js";
import SmTicket from "../smTickets/smTickets.model.js";
import PaymentOption from "../paymentOption/paymentOption.model.js";
import {
  generateAccessPass,
  sendAR,
  getOpenParkExpiry,
} from "../sale/sale.controller.js";
import { pool } from "../../database/mysql/index.js";
import { format } from "date-fns";
import { cronSyncSMTickets } from "../../helpers/cronjobs.js";

export const paymayaRequestCheckout = async (req, res) => {
  const paymayaPK = process.env.PAYMAYA_PUBLIC_KEY;
  const PaymayaCredentialsBase64 = Buffer.from(paymayaPK + ":").toString("base64");
  const paymayaEnvironment = process.env.PAYMAYA_ENVIRONMENT || "sandbox";
  const paymayaBaseURL = paymayaEnvironment !== "prod" ? "https://pg-sandbox.paymaya.com/checkout/v1/checkouts" : "https://pg.paymaya.com/checkout/v1/checkouts";

  const { refId, customerFirstName, customerLastName } = req.body;

  const sale = await Sale.findOne({ refId: refId })
    .populate({
      path: "cartItems",
      populate: {
        path: "ticketId",
        model: "Ticket",
        select: "name -_id",
      },
    })
    .exec();

  if (!sale) {
    return res.status(400).json({
      error: "Sale not found",
      message: "Please contact support",
    });
  }

  const checkoutItems = sale.cartItems.map((item) => {
    return {
      name: item.ticketId.name,
      quantity: item.qty,
      totalAmount: {
        value: (item.priceAcquired * item.qty).toFixed(2),
        currency: "PHP",
      },
    };
  });

  //Create Checkout Session with Paymaya
  const checkoutPayload = {
    items: checkoutItems,
    totalAmount: {
      value: sale.orderTotal.toFixed(2),
      currency: "PHP",
    },
    buyer: {
      firstName: customerFirstName || sale.customerName.split(" ")[0] || "",
      lastName: customerLastName || sale.customerName.split(" ")[1] || "",
      contact: {
        phone: sale.contactNumber || "",
        email: sale.emailAddress || "",
      }
    },
    redirectUrl: {
      success: `${process.env.WEBSITE_URL}/?payment=success&refid=${refId}`,
      failure: `${process.env.WEBSITE_URL}/?payment=failure&refid=${refId}`,
      cancel: `${process.env.WEBSITE_URL}/?payment=cancel&refid=${refId}`,
    },
    requestReferenceNumber: refId,
    metadata: {},
  };

  //Send Checkout Payload to Paymaya API
  try {
    const paymayaResponse = await fetch(paymayaBaseURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${PaymayaCredentialsBase64}`,
      },
      body: JSON.stringify(checkoutPayload),
    });

    if (!paymayaResponse.ok) {
      console.error("Paymaya Create Checkout Error:", paymayaResponse);
      return res.status(400).json({
        error: "Paymaya create checkout failed",
      });
    }

    const paymayaData = await paymayaResponse.json();

    console.log("Paymaya Checkout Response: ", paymayaData);

    return res.status(200).json({
      success: true,
      data: paymayaData,
    });
  } catch (error) {
    console.error("Paymaya Create Checkout Exception:", error);
    return res.status(502).json({
      error: "Paymaya create checkout failed",
      message: "An error occurred while creating Paymaya checkout",
    });
  }
};

export const paymayaPaymentSuccess = async (req, res) => {
  console.log("TRIGGERING WEBHOOK: PAYMAYA PAYMENT SUCCESS");
  console.log("PAYMAYA PAYLOAD: ", req.body);

  console.log("(TEMPORARY) req.headers[cf-connecting-ip]: ", req.headers["cf-connecting-ip"]);
  console.log("(TEMPORARY) req.ip: ", req.ip);

  // req.ip is resolved via Express's trust proxy setting, so it safely
  // handles multi-value X-Forwarded-For instead of treating it as one IP.
  // Take only the first value in case a header was duplicated, and strip
  // the ::ffff: prefix Node adds to IPv4 addresses on dual-stack sockets.
  const rawIp = req.headers['cf-connecting-ip'] || req.ip;
  const ip = rawIp?.split(",")[0].trim().replace(/^::ffff:/, "");
  // Comma-separated list of IPs allowed to call the Paymaya webhook, e.g. "18.138.50.235,3.1.207.200"
  const PAYMAYA_ALLOWED_IPS = (process.env.PAYMAYA_ALLOWED_IPS || "")
    .split(",")
    .map((ip) => ip.trim())
    .filter(Boolean);

  if (!ip || !PAYMAYA_ALLOWED_IPS.includes(ip)) {
    console.log("PAYMAYA WEBHOOK REQUEST IP NOT ALLOWED: ", ip);
    return res.status(200).json({
      error: "Forbidden",
      message: "IP not allowed",
    });
  }

  const { status, requestReferenceNumber, amount } = req.body;
  const option = "paymaya";
  const sale = await Sale.findOne({ refId: requestReferenceNumber }).exec();
  const pOption = await PaymentOption.findOne({ slug: option })
    .select("_id status")
    .exec();

  if (!sale) {
    console.log("PAYMAYA PAYMENT SALE NOT FOUND: ", requestReferenceNumber);
    return res.status(200).json({
      error: "Sale not found",
      message: "Please contact support",
    });
  }

  if (!sale || amount != sale.orderTotal) {
    console.log("PAYMAYA PAYMENT AMOUNT MISMATCH: ", amount, "EXPECTED: ", sale.orderTotal);
    return res.status(200).json({
      error: "Payment amount mismatch",
      message: "Please contact support",
    });

    //Send email to customer, support indicating that there was a discrepancy between the payment amount and the order total.
    //Send email to support to process refund, indicate that no tickets were released due to the discrepancy. 
    //Indiciate the amount received and the expected amount, and that the customer should be refunded the amount paid.
  }

  if (pOption.status == false) {
    console.log("PAYMAYA PAYMENT OPTION DISABLED: ", pOption.status);
    return res.status(200).json({
      error: "Payment option is disabled",
      message: "Please contact support",
    });

    //Send email to customer, support indicating that Star City is currently not accepting payments from paymaya.
    //Send email to support to process refund if account is charged, indicate that no tickets were released due to the payment option being disabled. Indicate that the customer should be refunded the amount paid if customer was charged.

  }

  if (!!status && status !== "PAYMENT_SUCCESS") {
    console.log("PAYMAYA PAYMENT STATUS NOT SUCCESS: ", status);
    return res.status(200).json({
      error: "Payment status not successful",
      message: "Please contact support",
    });
  }

  if (sale && sale.status == status) {
    console.log("PAYMAYA PAYMENT STATUS ALREADY PROCESSED: ", status);
    return res.status(200).json({
      error: "Payment status already processed",
      message: "Please contact support",
    });
  }

  sale.status = status;
  sale.paymentDetails = {
    option: await pOption._id,
    referenceNumber: requestReferenceNumber,
    status: status,
  };

  try {
    const result = await sale.save();
    res
      .status(200)
      .json({ status: status, message: "Paymaya payment processed" });

    //send Acknowledgement receipt
    if (status == "PAYMENT_SUCCESS") {
      console.log("GENERATING ACCESS PASS");
      generateAccessPass(result, result.cartItems);
      console.log("SENDING ACKNOWLEDGEMENT RECEIPT");
      sendAR(result.refId);
    }
  } catch (err) {
    return res.status(400).json({
      error: "Unable to process Paymaya payment",
      message: err,
    });
  }
};

export const paymayaPaymentFailed = async (req, res) => {
  res.status(200).json({
    function: "PaymayaPaymentFailed",
    resPayload: req.body,
    params: req.params,
  });
};

export const paymayaPaymentExpired = async (req, res) => {
  res.status(200).json({
    function: "PaymayaPaymentExpired",
    resPayload: req.body,
    params: req.params,
  });
};

export const dragonPaySuccess = async (req, res) => {
  console.log("DRAGONPAY POSTBACK RECIEVED...");
  const option = "dragonpay";
  if (req.body.txnid && req.body.refno && req.body.status && req.body.message) {
    console.log("UPDATING TRANSACTION...");
    const { txnid, refno, status, message, amount, digest } = req.body;

    const sale = await Sale.findOne({
      refId: txnid,
    }).exec();

    const pOption = await PaymentOption.findOne({ slug: option })
      .select("_id")
      .exec();

    if (!sale) {
      console.log("DRAGONPAY TRANSACTION NOT FOUND: ", txnid);
      return res.status(200).json({
        error: "Sale not found",
        message: "Please contact support",
      });
    }

    if (!pOption || pOption.status == false) {
      console.log("DRAGONPAY PAYMENT OPTION DISABLED: ", pOption.status);
      return res.status(200).json({
        error: "Payment option is disabled",
        message: "Please contact support",
      });
    }

    if (amount.toFixed(2) != sale.orderTotal.toFixed(2)) {
      console.log("DRAGONPAY PAYMENT AMOUNT MISMATCH: ", amount, "EXPECTED: ", sale.orderTotal);
      return res.status(200).json({
        error: "Payment amount mismatch",
        message: "Please contact support",
      });
    }

    sale.status = status;
    sale.paymentDetails = {
      option: await pOption._id,
      referenceNumber: refno,
      status: status,
      amountPaid: amount,
    };

    const result = await sale.save();
    //send Acknowledgement receipt
    if (status == "S" || status == "s") {
      console.log("GENERATING ACCESS PASS");
      generateAccessPass(result, result.cartItems);
      console.log("SENDING ACKNOWLEDGEMENT RECEIPT");
      sendAR(result.refId);
    }

    res.setHeader("Content-Type", "text/plain");
    res.send("result=OK");
  } else {
    res.setHeader("Content-Type", "text/plain");
    res.send("result=PAYLOAD_EMPTY");
    console.log("DRADONPAY REQUEST PAYLOAD EMPTY...");
  }
};

export const dragonPayReturn = async (req, res) => {
  await setTimeout(function () { }, 3000);
  res.redirect(
    `${process.env.WEBSITE_URL}/?payment=success&refid=${req.query.txnid}`
  );
};

const addToQueue = async (
  tokenID,
  rideCode,
  ticketExpiry,
  status = "for delivery"
) => {
  let newQ = new SmQueue();
  newQ.tokenID = tokenID;
  newQ.RideCode = rideCode;
  newQ.status = status;
  newQ.ticketExpiry = ticketExpiry;

  try {
    const newQueue = await newQ.save();
    console.log("QUEUE CREATED FOR SM TICKET: ", tokenID);
  } catch (err) {
    console.log("ERROR IN QUEUEING SM TICKET: ", err);
  }
};

const checkExisting = (tickets) => {
  return new Promise((resolve, reject) => {
    const idArray = tickets.map((item) => item.ticketID);
    pool.getConnection(async (err, connection) => {
      if (err) {
        reject({ status: "Connection failed" });
      } else {
        let sql = `SELECT * FROM admission_history WHERE admission_no IN (?) AND status="Purchased";`;
        let values = [idArray];

        connection.query(sql, values, (error, results, fields) => {
          if (error) {
            reject({ status: "Query failed" });
          }
          resolve(results);
        });
        connection.release();
      }
    });
  });
};

const processTickets = (tickets) => {
  tickets.map(async (item) => {
    const { ticketID, ticketType, ticketExpiry } = item;
    console.log("PROCESSING TICKET: ", item);

    //record new tiken
    const newticket = new SmTicket();
    newticket.tokenId = ticketID;
    newticket.method = "Purchase";
    newticket.ticketType = ticketType;
    if (ticketExpiry) {
      newticket.ticketExpiry = ticketExpiry;
    } else {
      newticket.ticketExpiry = `${format(
        new Date(getOpenParkExpiry()),
        "yyyy-LL-dd"
      )} 23:59:59`;
    }

    try {
      const result = await newticket.save();
      console.log("SM Ticket recorded: ", ticketID);
    } catch (err) {
      console.log(err);
    }

    try {
      pool.getConnection(async (err, connection) => {
        if (err) {
          addToQueue(
            ticketID,
            ticketType,
            ticketExpiry
              ? ticketExpiry
              : `${format(
                new Date(getOpenParkExpiry()),
                "yyyy-LL-dd"
              )} 23:59:59`
          );
        } else {
          const date = format(new Date(), "yyyy-MM-dd");
          const time = format(new Date(), "HH:mm:ss");
          const expiry = ticketExpiry
            ? ticketExpiry
            : `${format(new Date(getOpenParkExpiry()), "yyyy-LL-dd")} 23:59:59`;

          const values = [
            [
              ticketID,
              "Pop Tag",
              date,
              time,
              "Purchased",
              "smticket",
              "1",
              ticketType,
              expiry,
            ],
          ];
          const sql =
            "INSERT INTO admission_history (admission_no, type, date, time, status, origin, syncStatus, RideCode, expiration_date) VALUES ?;";

          connection.query(sql, [values], function (error, results, fields) {
            if (error) {
              addToQueue(ticketID, ticketType, expiry, "Error in mySQL Insert");
            } else if (results.affectedRows < 1) {
              addToQueue(
                ticketID,
                ticketType,
                expiry,
                "Error in mySQL insert, no affected rows"
              );
            } else {
              console.log("SM TICKET PROCESSED SUCCESS: ", ticketID);
            }
          });
          connection.release();
        }
      });
    } catch (e) {
      addToQueue(
        ticketID,
        ticketType,
        ticketExpiry
          ? ticketExpiry
          : `${format(new Date(getOpenParkExpiry()), "yyyy-LL-dd")} 23:59:59`,
        "Error in mySQL"
      );
    }
  });
};

export const smTicketTest = async (req, res) => {
  cronSyncSMTickets();

  res.status(200).json({
    message: "Connection Test Success",
  });
};

export const smTicketExpiry = async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    // expiry: getOpenParkExpiry(),
    expiry: `${format(new Date(getOpenParkExpiry()), "yyyy-LL-dd")} 23:59:59`,
  });
};

export const smTicketTransact = async (req, res) => {
  console.log("PROCESSING SM TICKETS TRANSACTION...");
  const { tickets, token } = req.body;

  if (token == process.env.SM_TOKEN) {
    if (tickets) {
      checkExisting(tickets)
        .then((data) => {
          if (data.length > 0) {
            res.status(400).json({
              status: "TicketID already exists",
              message: "Please provide unique IDs",
              existingIDs: data.map((item) => item.admission_no),
            });
          } else {
            processTickets(tickets);
            res.status(200).json({
              status: "Success",
              message: "Tickets synchronized successfully",
            });
          }
        })
        .catch((error) => {
          processTickets(tickets);
          res.status(200).json({
            status: "Success",
            message:
              "Tickets synchronized successfully but duplicates not checked",
          });
        });
    } else {
      res.status(400).json({
        status: "Invalid Transaction",
        message: "Server received empty tickets. No IDs to sync with system",
      });
    }
  } else {
    res.status(401).json({
      status: "Invalid Auth Token",
      message: "Please make sure that your token in your request body is valid",
    });
  }
};

export const smTicketVoid = async (req, res) => {
  console.log("VOIDING SM TICKET TRANSACTION...");
  const { token, tickets } = req.body;

  if (token == process.env.SM_TOKEN) {
    if (tickets) {
      tickets.map(async (item) => {
        const { ticketID } = item;
        console.log("VOIDING TICKET: ", ticketID);

        //record new tiken
        const newticket = new SmTicket();
        newticket.tokenId = ticketID;
        newticket.method = "Void";

        try {
          const result = await newticket.save();
          console.log("SM Ticket voided: ", ticketID);
        } catch (err) {
          console.log(err);
        };

        try {
          pool.getConnection(async (err, connection) => {
            if (err) {
              console.log("ERROR IN MYSQL CONNECTION");
              return res.status(500).json({
                status: "Internal Server Error",
                message: "Cannot connect to Turnstile System",
              });
            } else {
              let sql = `UPDATE tablebarcode SET status = 0, isSnowWorld = 0 WHERE barcode_number = ?;UPDATE admission_history SET status = "Void" WHERE admission_no=?;`;
              let values = [ticketID, ticketID];

              connection.query(sql, values, function (error, results, fields) {
                if (error) {
                  console.log("Error on executing query...");
                  return res.status(400).json({
                    status: "Query Error",
                    message: "Query Execution Failed",
                  });
                } else if (results.affectedRows < 1) {
                  console.log("No affected rows");
                } else {
                  console.log("SM TICKET VOID SUCCESS: ", ticketID);
                }
              });
              connection.release();
            }
          });
        } catch (e) {
          console.log("ERROR IN VOIDING TICKET...");
          return res.status(500).json({
            status: "Internal Server Error",
            message: "Cannot connect to Turnstile System",
          });
        }
      });
    } else {
      return res.status(400).json({
        status: "Invalid Transaction",
        message: "No Ticket IDs found",
      });
    }
  } else {
    return res.status(401).json({
      status: "Invalid Auth Token",
      message: "Please make sure that your token in your request body is valid",
    });
  }

  res.status(200).json({
    status: "Success",
    message: "Tickets voided successfully",
  });
};

export const bpiTransact = async (req, res) => {
  console.log(`PROCESSING BPI TRANSACTION...`);
  const { transactionReference, confirmationNumber, merchantTransactionReference, transactionStatus } = req.query;

  // /webhooks/v1/bpi?transactionReference=DDD69E7E36D9&confirmationNumber=undefined&transactionStatus=INCOMPLETE&statusCode=0&merchantTransactionReference=DDD69E7E36D9
  if (merchantTransactionReference && transactionStatus && transactionStatus == "SUCCESSFUL") {
    const sale = await Sale.findOne({ refId: merchantTransactionReference }).exec();
    if (sale) {
      if (sale.status == "awaiting payment") {
        //PROCESS SALE (GENERATE AND SEND AR)
        const option = "bpi";
        const pOption = await PaymentOption.findOne({ slug: option })
          .select("_id")
          .exec();

        if (!pOption || pOption.status == false) {
          console.log("BPI PAYMENT OPTION DISABLED: ", pOption.status);
          return res.redirect(`${process.env.WEBSITE_URL}/?payment=error&refid=${merchantTransactionReference}`);
        }

        sale.status = transactionStatus;
        sale.paymentDetails = {
          option: await pOption._id,
          referenceNumber: confirmationNumber,
          status: transactionStatus,
        };

        //UPDATE DATA
        try {
          const result = await sale.save();
          if (transactionStatus == "SUCCESSFUL") {
            console.log("GENERATING ACCESS PASS");
            generateAccessPass(result, result.cartItems);
            console.log("SENDING ACKNOWLEDGEMENT RECEIPT");
            sendAR(result.refId);
            return res.redirect(`${process.env.WEBSITE_URL}/?payment=success&refid=${result.refId}`);
          }
        } catch (err) {
          console.log("Unable to process BPI payment", err);
        }
        //SEND STATUS 200
      } else {
        console.log(`BPI: Reference ID ${transactionReference} ALREADY PROCESSED...`);
        return res.redirect(`${process.env.WEBSITE_URL}/?payment=success&refid=${transactionReference}`);
      }
    } else {
      console.log(`BPI: Reference ID ${transactionReference} NOT FOUND...`);
    }
  } else {
    console.log(`BPI: Reference ID ${transactionReference} NOT CONFIRMED`);
    return res.redirect(`${process.env.WEBSITE_URL}/?payment=success&refid=${transactionReference}`);

  }

};
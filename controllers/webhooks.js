const Sale = require("../models/sale");
const SmQueue = require("../models/smQueue");
const SmTicket = require("../models/smTickets");
const PaymentOption = require("../models/paymentOption");
const {
  generateAccessPass,
  sendAR,
  getOpenParkExpiry,
} = require("../controllers/sale");

const { pool } = require("../lib/mysql/connect");
const { format } = require("date-fns");

const { cronSyncSMTickets } = require("../helpers/cronjobs.js");

exports.paymayaRequestCheckout = async (req, res) => {
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
  const paymayaResponse = await fetch(paymayaBaseURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${PaymayaCredentialsBase64}`,
    },
    body: JSON.stringify(checkoutPayload),
  });

  const paymayaData = await paymayaResponse.json();

  if (!paymayaResponse.ok) {
    console.error("Paymaya Create Checkout Error:", paymayaData);
    return res.status(400).json({
      error: "Paymaya create checkout failed",
      message: paymayaData,
    });
  }

  console.log("Paymaya Checkout Response: ", paymayaData);

  return res.status(200).json({
    success: true,
    data: paymayaData,
  });
};

exports.paymayaPaymentSuccess = async (req, res) => {
  console.log("TRIGGERING WEBHOOK: PAYMAYA PAYMENT SUCCESS");
  console.log("PAYMAYA PAYLOAD: ", req.body);

  const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log('PAYMAYA WEBHOOK REQUEST IP: ', ip);

  const { status = 'success', requestReferenceNumber, amount } = req.body;
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
    if (status == "success" || status == "PAYMENT_SUCCESS") {
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

exports.paymayaPaymentFailed = async (req, res) => {
  res.status(200).json({
    function: "PaymayaPaymentFailed",
    resPayload: req.body,
    params: req.params,
  });
};

exports.paymayaPaymentExpired = async (req, res) => {
  res.status(200).json({
    function: "PaymayaPaymentExpired",
    resPayload: req.body,
    params: req.params,
  });
};

exports.paymayaAuthorized = async (req, res) => {
  res.status(200).json({
    function: "PaymayaAuthorized",
    resPayload: req.body,
    params: req.params,
  });
};

exports.paymayaCheckoutSuccess = async (req, res) => {
  res.status(200).json({
    function: "PaymayaCheckoutSuccess",
    resPayload: req.body,
    params: req.params,
  });
};

exports.paymayaCheckoutFailure = async (req, res) => {
  res.status(200).json({
    function: "PaymayaCheckoutFailure",
    resPayload: req.body,
    params: req.params,
  });
};

exports.paymayaCheckoutDropout = async (req, res) => {
  res.status(200).json({
    function: "PaymayaCheckoutDropout",
    resPayload: req.body,
    params: req.params,
  });
};

exports.dragonPaySuccess = async (req, res) => {
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

exports.dragonPayReturn = async (req, res) => {
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

exports.smTicketTest = async (req, res) => {
  cronSyncSMTickets();

  res.status(200).json({
    message: "Connection Test Success",
  });
};

exports.smTicketExpiry = async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    // expiry: getOpenParkExpiry(),
    expiry: `${format(new Date(getOpenParkExpiry()), "yyyy-LL-dd")} 23:59:59`,
  });
};

exports.smTicketTransact = async (req, res) => {
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

exports.smTicketVoid = async (req, res) => {
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

exports.paypalProcess = async (req, res) => {
  console.log("EVENT TYPE: ", req.body.eventType);
  const { status, refId, id } = req.body;
  const option = "paypal";
  const sale = await Sale.findOne({ refId: refId }).exec();
  const pOption = await PaymentOption.findOne({ slug: option })
    .select("_id")
    .exec();

  sale.status = status;
  sale.paymentDetails = {
    option: await pOption._id,
    referenceNumber: id,
    status: status,
  };

  try {
    const result = await sale.save();
    res
      .status(200)
      .json({ status: status, message: "Paypal payment processed" });

    //send Acknowledgement receipt
    if (status == "COMPLETED" || status == "CAPTURE" || status == "APPROVED") {
      console.log("GENERATING ACCESS PASS");
      generateAccessPass(result, result.cartItems);
      console.log("SENDING ACKNOWLEDGEMENT RECEIPT");
      sendAR(result.refId);
    }
  } catch (err) {
    return res.status(400).json({
      error: "Unable to process Paypal payment",
      message: err,
    });
  }
};

exports.paypalOnApprove = async (req, res) => {
  console.log("TRIGGERING WEBHOOK: PAYPAL PAYMENT APPROVED");
  console.log("EVENT TYPE: ", req.body.event_type);
  console.log("REF ID: ", req.body.resource.purchase_units[0].reference_id);
  console.log("STATUS: ", req.body.resource.status);
  console.log("TRANSACTION NUMBER: ", req.body.resource.id);

  //REF ID ON PAYMENT.CAPTURE.COMPLETED: req.body.resource.supplementary_data.related_ids.reference_id ??
  //REF ID ON CHECKOUT.ORDER.COMPLETED: req.body.resource.purchase_units[0].reference_id ??
  if (req.body.event_type == "PAYMENT.CAPTURE.COMPLETED") {
    res.status(200).json({ status: "ok" });
  }

  //PSEUDO CODE
  //GET DETAILS
  const refId = req.body.resource.purchase_units[0].reference_id;
  const id = req.body.resource.id;
  const status = req.body.resource.status;

  //FIND SALE WITH REF ID
  const sale = await Sale.findOne({ refId: refId }).exec();

  //IF EXISTS
  if (sale) {
    //CHECK STATUS
    //IF AWAITING PAYMENT
    if (sale.status == "awaiting payment") {
      //PROCESS SALE (GENERATE AND SEND AR)
      const option = "paypal";
      const pOption = await PaymentOption.findOne({ slug: option })
        .select("_id")
        .exec();

      sale.status = status;
      sale.paymentDetails = {
        option: await pOption._id,
        referenceNumber: id,
        status: status,
      };

      //UPDATE DATA
      try {
        const result = await sale.save();
        res.status(200).json({ status: "ok" });
        if (
          status == "COMPLETED" ||
          status == "CAPTURE" ||
          status == "APPROVED"
        ) {
          console.log("GENERATING ACCESS PASS");
          generateAccessPass(result, result.cartItems);
          console.log("SENDING ACKNOWLEDGEMENT RECEIPT");
          sendAR(result.refId);
        }
      } catch (err) {
        return res.status(400).json({
          error: "Unable to process Paypal payment",
          message: err,
        });
      }

      //SEND STATUS 200
    } else if (
      sale.status == "COMPLETED" ||
      sale.status == "CAPTURE" ||
      sale.status == "APPROVED"
    ) {
      //IF ALREADY COMPLETED
      //SEND STATUS 200
      res.status(200).json({ status: "ok" });
      console.log(`REF ID ${refId} ALREADY PROCESSED`);
    }
  } else {
    //NOT EXISTING
    //SEND STATUS 200 BUT ALERT THAT REF ID NOT FOUND
    res.status(200).json({ status: "ok" });
    console.log(`WEBHOOK ID ${id} RECEIVED BUT REF ID ${refId} NOT FOUND`);
  }
};

exports.bpiTransact = async (req, res) => {
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
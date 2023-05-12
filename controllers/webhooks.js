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

exports.paymayaPaymentSuccess = async (req, res) => {
  console.log("TRIGGERING WEBHOOK: PAYMAYA PAYMENT SUCCESS");
  const { status, requestReferenceNumber } = req.body;
  const option = "paymaya";
  const sale = await Sale.findOne({ refId: requestReferenceNumber }).exec();
  const pOption = await PaymentOption.findOne({ slug: option })
    .select("_id")
    .exec();

  sale.status = status;
  sale.paymentDetails = {
    option: await pOption._id,
    referenceNumber: requestReferenceNumber,
    status: status,
  };

  sale.save((err, result) => {
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
  });
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

    sale.save((err, result) => {
      //send Acknowledgement receipt
      if (status == "S" || status == "s") {
        console.log("GENERATING ACCESS PASS");
        generateAccessPass(result, result.cartItems);
        console.log("SENDING ACKNOWLEDGEMENT RECEIPT");
        sendAR(result.refId);
      }
    });

    res.setHeader("Content-Type", "text/plain");
    res.send("result=OK");
  } else {
    res.setHeader("Content-Type", "text/plain");
    res.send("result=PAYLOAD_EMPTY");
    console.log("DRADONPAY REQUEST PAYLOAD EMPTY...");
  }
};

exports.dragonPayReturn = async (req, res) => {
  await setTimeout(function () {}, 3000);
  res.redirect(
    `${process.env.WEBSITE_URL}/?payment=success&refid=${req.query.txnid}`
  );
};

const addToQueue = (
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
  newQ.save((err, result) => {
    if (err) {
      console.log("ERROR IN QUEUEING SM TICKET: ", err);
    } else {
      console.log("QUEUE CREATED FOR SM TICKET: ", tokenID);
    }
  });
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
  tickets.map((item) => {
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

    newticket.save((err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("SM Ticket recorded: ", ticketID);
      }
    });

    try {
      pool.getConnection(async (err, connection) => {
        if (err) {
          addToQueue(
            ticketID,
            ticketType,
            `${format(new Date(getOpenParkExpiry()), "yyyy-LL-dd")} 23:59:59`, //TEMP FIX
            "Error in mySQL Connection"
          );
        } else {
          const date = format(new Date(), "yyyy-MM-dd");
          const time = format(new Date(), "HH:mm:ss");
          const expiry = `${format(
            new Date(getOpenParkExpiry()),
            "yyyy-LL-dd"
          )} 23:59:59`;

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
              addToQueue(
                ticketID,
                ticketType,
                expiry,
                "Error in mySQL Insert"
              );
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
      addToQueue(ticketID, ticketType, expiry, "Error in mySQL");
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
      tickets.map((item) => {
        const { ticketID } = item;
        console.log("VOIDING TICKET: ", ticketID);

        //record new tiken
        const newticket = new SmTicket();
        newticket.tokenId = ticketID;
        newticket.method = "Void";

        newticket.save((err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("SM Ticket voided: ", ticketID);
          }
        });

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

  sale.save((err, result) => {
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
  });
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
      sale.save((err, result) => {
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
      });

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

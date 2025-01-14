const AccessPassQueue = require("../models/accessPassQueue");
const SmQueue = require("../models/smQueue");
const EmailQueue = require("../models/emailQueue");
const Sale = require("../models/sale");
const AccessPass = require("../models/accessPass");
const PaymentOption = require("../models/paymentOption");
const Ticket = require("../models/ticket");

const { pool } = require("../lib/mysql/connect");
const { addAuditTrailEntry } = require("../helpers/auditTrailHandler");
const { format } = require("date-fns");
const startOfYesterday = require('date-fns/startOfYesterday')
const endOfYesterday = require('date-fns/endOfYesterday')
const { sendMail } = require("../helpers/nodemailer");
const { convertArrayToCSV } = require('convert-array-to-csv');
const { zonedTimeToUtc, utcToZonedTime } = require("date-fns-tz");

const sale = require("../controllers/sale");

exports.cronSyncAP = async () => {
  const queues = await AccessPassQueue.find({}).populate("accessPass").exec();

  if (queues.length > 0) {
    console.log("**** RUNNING ACCESS PASS SYNC WITH TURNSTILE ****");
    console.log("Number of Queues: ", queues.length);
    try {
      pool.getConnection((err, connection) => {
        if (err) {
          console.log("CONNECTION ERRER: ", err);
        } else {
          queues.map((q) => {
            const date = format(q.accessPass.createdAt, "yyyy-MM-dd");
            const time = format(q.accessPass.createdAt, "HH:mm:ss");

            //extract itemCode from AccessToken
            const RideCode = q.accessPass.accessToken.match("-(.*)-")[1];

            const values = [
              [
                q.accessPass.accessToken,
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
                console.log("FAILED TO SYNC: ", q.accessPass.accessToken);
                addAuditTrailEntry({
                  action: `System failed to sync Access Pass: ${q.accessPass.accessToken}`,
                  meta: error,
                });
              } else if (results.affectedRows < 1) {
                console.log(
                  `UNABLE TO INSERT TO DATABASE ACCESS TOKEN: `,
                  accessPass.accessToken
                );
              } else {
                //remove in queue;
                AccessPassQueue.deleteOne({ _id: q._id }).exec();
                console.log(
                  "ACCESSPASS SUCCESS FOR ID: ",
                  q.accessPass.accessToken
                );
              }
            });
          });
        }
      });
    } catch (e) {
      console.log(e);
    }
  }
};

exports.cronSyncSMTickets = async () => {
  const queues = await SmQueue.find({}).exec();

  if (queues.length > 0) {
    console.log("**** RUNNING SM TICKETES SYNC WITH TURNSTILE ****");
    console.log("Number of Queues: ", queues.length);

    try {
      pool.getConnection((err, connection) => {
        if (err) {
          console.log("CONNECTION ERRER: ", err);
          return 0;
        }

        queues.map((q) => {
          const date = format(q.createdAt, "yyyy-MM-dd");
          const time = format(q.createdAt, "HH:mm:ss");
          const expiry = q.ticketExpiry;
          const ticketType = q.Ridecode;
          const values = [
            [
              q.tokenID,
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
            //if Error: do not remove in queue
            if (error) {
              console.log("Unable to process SM Queue: ", error);
              return 0;
            }

            if (results.affectedRows < 1) {
              console.log("Unable to process SM Queue: no affected rows");
              return 0;
            }

            // no error (remove from queue);
            console.log("SM Queue Processed for tokenID: ", q.tokenID);
            SmQueue.deleteOne({ tokenID: q.tokenID }).exec();
            return 1;
          });
        });
      });
    } catch (e) {
      console.log("Error on MySQL Connection: ");
      console.log(e);
      return 0;
    }
  }
};

exports.forceSync = async (skip, limit) => {
  const queues = await AccessPassQueue.find({})
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .populate("accessPass")
    .exec();

  if (queues.length > 0) {
    console.log("**** RUNNING ACCESS PASS SYNC WITH TURNSTILE ****");
    console.log("Number of Queues: ", queues.length);
    try {
      pool.getConnection((err, connection) => {
        if (err) {
          console.log("CONNECTION ERRER: ", err);
        } else {
          queues.map((q) => {
            const date = format(q.accessPass.createdAt, "yyyy-MM-dd");
            const time = format(q.accessPass.createdAt, "HH:mm:ss");

            //extract itemCode from AccessToken
            const RideCode = q.accessPass.accessToken.match("-(.*)-")[1];

            const values = [
              [
                q.accessPass.accessToken,
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
                console.log("FAILED TO SYNC: ", q.accessPass.accessToken);
                addAuditTrailEntry({
                  action: `System failed to sync Access Pass: ${q.accessPass.accessToken}`,
                  meta: error,
                });
              } else if (results.affectedRows < 1) {
                console.log(
                  `UNABLE TO INSERT TO DATABASE ACCESS TOKEN: `,
                  accessPass.accessToken
                );
              } else {
                //remove in queue;
                AccessPassQueue.deleteOne({ _id: q._id }).exec();
                console.log(
                  "ACCESSPASS SUCCESS FOR ID: ",
                  q.accessPass.accessToken
                );
              }
            });
          });
        }
      });
    } catch (e) {
      console.log(e);
    }
  }
};

exports.cronProcessEmailQueues = async () => {
  const Qs = await EmailQueue.find().exec();
  if (Qs.length > 0) {
    console.log("**** PROCESSING QUEUED EMAIL ****");
    console.log("Number of Queued emails: ", Qs.length);

    Qs.map(async (q) => {
      //remove q from database
      await EmailQueue.deleteOne({ _id: q._id }).exec();
      const isResolved = await sale.sendAR(q.refId);
      if (!isResolved) {
        console.log("Email not sent. Refid requeued");
      }
    });
  }
};

exports.dbcleanup = async () => {
  let previous2Months = new Date();
  previous2Months.setDate(previous2Months.getDate() - parseInt(process.env.DATA_RETENTION_DAYS));

  console.log("**** CLEANING UP DATABASE ****");

  const accessPassCount = await AccessPass.countDocuments({
    createdAt: { $lte: previous2Months },
  });

  const saleCount = await Sale.countDocuments({
    createdAt: { $lte: previous2Months },
  });

  const deleteAccessPass = await AccessPass.deleteMany(
    {
      createdAt: { $lte: previous2Months },
    },
    function (err) { }
  );

  const deleteSalesData = await Sale.deleteMany(
    {
      createdAt: { $lte: previous2Months },
    },
    function (err) { }
  );

  console.log("Database clean up: Removing data before -", format(previous2Months, "PPpp"));
  console.log("Database clean up: Deleted Access Pass -", accessPassCount);
  console.log("Database clean up: Deleted Sales Data -", saleCount);
}

exports.generateDailyReport = async () => {
  console.log("Generating Daily Report");

  const datetime = new Date().toISOString().split('T')[0];

  // const formattedDatetime = format(datetime, "yyyy-MM-dd");

  const start = zonedTimeToUtc(`${datetime}T00:00:00.000`, 'Asia/Manila')
  const formattedStartTime = format(start, "PPp")

  const end = zonedTimeToUtc(`${datetime}T23:59:59.999`, 'Asia/Manila')
  const formattedEndTime = format(end, "PPp")

  //set date range to be covered
  // const start = startOfYesterday();
  // const end = endOfYesterday();

  //get sales data in date range
  const salesData = await Sale.find({
    status: {
      $nin: ["awaiting payment", "P", "p"],
    },
    updatedAt: {
      $gte: start,
      $lte: end,
    }
  })
    .select('updatedAt customerName emailAddress contactNumber refId contactnumber orderTotal paymentDetails cartItems')
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
    .exec();

  //Initialize Summary Values
  let numOfTransaction = 0;
  let totalTransactionPrice = 0;
  let ticketsSold = 0;

  //Initialize Tickets Summary Values
  const ticketsData = await Ticket.find({
  })
    .select('name')
    .exec();

  let ticketsArray = ticketsData.map((ticket, key) => {
    return { id: ticket._id, name: ticket.name, qty: 0 }
  })

  //Initialize Payment Details Summary
  const paymentsData = await PaymentOption.find({
  })
    .select('name')
    .exec();

  let paymentsArray = paymentsData.map((po, key) => {
    return { id: po._id, name: po.name, qty: 0, amount: 0 }
  })

  const dataArray = salesData.map((data, key) => {
    numOfTransaction += 1;
    totalTransactionPrice += data.orderTotal;

    //update payment option counter
    const paymentOptionIndex = paymentsArray.findIndex(obj => obj.name == data.paymentDetails?.option?.name);
    if (paymentOptionIndex !== -1) {
      paymentsArray[paymentOptionIndex].qty += 1;
      paymentsArray[paymentOptionIndex].amount += data.orderTotal;
    }

    return {
      confirmationTime: format(utcToZonedTime(data.updatedAt, "Asia/Manila"), "PPp"),
      customerName: data.customerName,
      transactionNumber: data.refId,
      paymentGateway: data.paymentDetails?.option?.name,
      ticketType: `${convertArrayToCSV(data.cartItems.map((ticket, key) => {
        ticketsSold += ticket.qty;

        //update tickets counter
        const ticketIndex = ticketsArray.findIndex(obj => obj.name == ticket.ticketId?.name);
        if (ticketIndex !== -1) {
          ticketsArray[ticketIndex].qty += ticket.qty;
        }

        return [ticket.ticketId?.name, ticket.qty, ticket.ticketId?.price]
      }))}\n`,
      price: parseFloat(data.orderTotal).toFixed(2),
      emailAddress: data.emailAddress,
      mobileNumber: data.contactNumber
    }
  })

  const salesDataCSV = convertArrayToCSV(dataArray);

  const details = {
    to: process.env.REPORTS_RECIPIENT,
    from: process.env.EMAIL_ADDRESS,
    subject:
      `Sales Summary for ${format(start, "yyyy-MM-dd")}`,
    html: `
    <h1>Sales Summary for ${formattedStartTime} - ${formattedEndTime}</h1>
    <p>Total Number of Transactions: ${numOfTransaction}</p>
    <p>Total Price of Transactions: ₱${parseFloat(totalTransactionPrice).toFixed(2)}</p>
    <p>Total Number of Tickets Sold: ${ticketsSold}</p>

    <h2>Tickets Summary</h2>
    ${ticketsArray.map((row => { return `<p>${row.name}: ${row.qty}</p>` })).join('')}
    <h2>Payment Channel Summary</h2>
    ${paymentsArray.map(((row) => {
      const ticketCounter = ticketsData.map((ticket, key) => {
        return { name: ticket.name, qty: 0 }
      })

      salesData.map((data) => {
        if (data.paymentDetails?.option?.name === row.name) {
          data.cartItems.map((ticket) => {
            const ticketIndex = ticketCounter.findIndex(obj => obj.name == ticket.ticketId?.name);
            if (ticketIndex !== -1) {
              ticketCounter[ticketIndex].qty += ticket.qty;
            }
          })
        }
      })

      return `<h4>${row.name}</h4>
              <p style="margin-left: 20px">Transactions: ${row.qty}</p>
              <p style="margin-left: 20px">Amount: ₱${parseFloat(row.amount).toFixed(2)}</p>
              ${ticketCounter.map((counter) => {
        return `<p style="margin-left: 20px">${counter.name}: ${counter.qty}</p>`;
      }).join('')}`
    })).join('')}
    `,
    attachments: [{
      filename: `Daily Sales Data - ${format(start, "PP")}.csv`,
      content: salesDataCSV   // attaching csv in the content
    }],
  };

  try {
    sendMail(details).then((info) => {
      console.log("Email Report Info: ", info);
      //check info if undefined
      if (info === undefined) {
        //create email queue
      } else {
        console.log("Daily Report Sent");
      }
    });
  } catch (e) {
    console.log(e);
    console.log("Failed trying to send daily report")
  }
}

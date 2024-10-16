const AccessPassQueue = require("../models/accessPassQueue");
const SmQueue = require("../models/smQueue");
const EmailQueue = require("../models/emailQueue");
const Sale = require("../models/sale");
const AccessPass = require("../models/accessPass");

const { pool } = require("../lib/mysql/connect");
const { addAuditTrailEntry } = require("../helpers/auditTrailHandler");
const { format } = require("date-fns");
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

const AccessPassQueue = require("../models/accessPassQueue");
const EmailQueue = require("../models/emailQueue");

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

const AccessPassQueue = require("../models/accessPassQueue");
const { pool } = require("../lib/mysql/connect");
const { addAuditTrailEntry } = require("../helpers/auditTrailHandler");
const { format } = require("date-fns");

exports.cronSyncAP = async () => {
  const queues = await AccessPassQueue.find({}).populate("accessPass").exec();

  if (queues.length > 0) {
    console.log("**** RUNNING ACCESS PASS SYNC WITH TURNSTILE ****");
    console.log("Number of Queues: ", queues.length);
    try {
      pool.getConnection((err, connection) => {
        if (err) {
          console.log("ERROR: ", err);
        } else {
          queues.map((q) => {
            const date = format(q.accessPass.createdAt, "yyyy-MM-dd");
            const time = format(q.accessPass.createdAt, "HH:mm:ss");

            const values = [
              [
                q.accessPass.accessToken,
                "Pop Tag",
                date,
                time,
                "Purchased",
                "web",
                "1",
                q.accessPass.itemCode,
              ],
            ];

            const sql =
              "INSERT INTO admission_history (admission_no, type, date, time, status, origin, syncStatus, rideCode) VALUES ?;";

            connection.query(sql, [values], function (error, results, fields) {
              if (error) {
                console.log("Failed to sync... Access Pass still in queue.");
                addAuditTrailEntry({
                  action: `System failed to sync Access Pass: ${q.accessPass.accessToken}`,
                  meta: error,
                });
              } else {
                //remove in queue;
                AccessPassQueue.deleteOne({ _id: q._id }).exec();
                console.log("Sync success... Removed from queue.");
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

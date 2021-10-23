const AccessPassQueue = require("../models/accessPassQueue");
const { pool } = require("../lib/mysql/connect");
const { addAuditTrailEntry } = require("../helpers/auditTrailHandler");

exports.cronSyncAP = async () => {
  const queues = await AccessPassQueue.find({}).populate("accessPass").exec();

  if (queues.length > 0) {
    console.log("**** RUNNING ACCESS PASS SYNC WITH TURNSTILE ****");
    console.log("Number of Queues: ", queues.length);
    try {
      pool.getConnection((err, connection) => {
        if (err) {
        } else {
          queues.map((q) => {
            const values = [["1", q.accessPass.accessToken, "1"]];
            const sql =
              "INSERT INTO tablebarcode (status, barcode_number, ip_group) VALUES ?;";

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

const AccessPassQueue = require("../models/accessPassQueue");
const { pool } = require("../lib/mysql/connect");
const { addAuditTrailEntry } = require("../helpers/auditTrailHandler");

exports.cronSyncAP = async () => {
  console.log("**** RUNNING ACCESS PASS SYNC WITH TURNSTILE ****");
  const queues = await AccessPassQueue.find({}).populate("accessPass").exec();
  console.log("Number of Queues: ", queues.length);

  if (queues.length > 0) {
    addAuditTrailEntry({ action: "System run Access Pass synchronization" });
    try {
      pool.getConnection((err, connection) => {
        if (err) {
          addAuditTrailEntry({
            action: "System failed to connect to SC Database",
            meta: err,
          });   
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
                addAuditTrailEntry({
                  action: `System successfully synced Access Pass: ${q.accessPass.accessToken}. Removed from Access Pass Queue.`,
                });
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

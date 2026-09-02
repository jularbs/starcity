const AccessPassQueue = require("./accessPassQueue.model")
exports.addToQueue = (accessPass, status) => {
    let q = new AccessPassQueue();
    q.accessPass = accessPass._id;
    q.status = status;
    q
        .save()
        .then(() => {
            console.log("QUEUE CREATED FOR ACCESS PASS: ", accessPass.accessToken);
        })
        .catch((err) => {
            console.log("ERROR IN QUEUEING ACCESS PASS: ", err);
        });
};
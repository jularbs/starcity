const AccessPassQueue = require("../models/accessPassQueue");

exports.smartTrim = (str, length, delim, appendix) => {
  if (str.length <= length) return str;

  var trimmedStr = str.substr(0, length + delim.length);

  var lastDelimIndex = trimmedStr.lastIndexOf(delim);
  if (lastDelimIndex >= 0) trimmedStr.substr(0, lastDelimIndex);

  if (trimmedStr) trimmedStr += appendix;

  return trimmedStr;
};

exports.addToQueue = (accessPass, status) => {
  let q = new AccessPassQueue();
  q.accessPass = accessPass._id;
  q.status = status;
  q.save((err, result) => {
    if (err) {
      console.log("ERROR IN QUEUEING ACCESS PASS: ", err);
    } else {
      console.log("QUEUE CREATED FOR ACCESS PASS: ", accessPass.accessToken);
    }
  });
};
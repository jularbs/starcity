const AuditTrail = require("../models/auditTrail");

exports.createEntry = (user, action, payload, req) => {
  const at = new AuditTrail();

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  if (user) {
    at.userName = user;
  }

  at.action = action;
  at.payload = payload;
  at.ipAddress = ip;

  at.save();
};

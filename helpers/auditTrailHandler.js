const AuditTrail = require("../models/auditTrail");

exports.addAuditTrailEntry = (data) => {
  const { action, user, meta } = data;

  let at = new AuditTrail();
  at.action = action;
  at.user = user;
  at.meta = meta;
  at.save();
};

const AuditTrail = require("./auditTrail.model");

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

exports.list = async (req, res) => {
  const { skip = 0, limit = 0 } = req.query;

  try {
    const auditTrails = await AuditTrail.find({})
      .select("userName action payload createdAt ipAddress -_id")
      .sort("-createdAt")
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .exec();

    const count = await AuditTrail.countDocuments();
    return res.json({ data: auditTrails, count });
  } catch (err) {
    console.log("Audit Error: ", err)
    return res.status(400).json({
      error: "Error occured",
    });
  }



};

exports.addAuditTrailEntry = (data) => {
  const { action, user, meta } = data;

  let at = new AuditTrail();
  at.action = action;
  at.user = user;
  at.meta = meta;
  at.save();
};

const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const auditTrailSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    user: {
      type: ObjectId,
      ref: "User",
    },
    meta: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditTrail", auditTrailSchema);

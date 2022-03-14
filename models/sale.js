const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const { Decimal128 } = mongoose.Schema.Types;

function getPrice(value) {
  if (typeof value !== "undefined") {
    return parseFloat(value.toString());
  }
  return value;
}

const cartItem = new mongoose.Schema(
  {
    ticketId: {
      type: ObjectId,
      ref: "Ticket",
      required: true,
    },
    priceAcquired: {
      type: Decimal128,
      default: 0,
      get: getPrice,
    },
    qty: {
      type: Number,
      required: true,
      default: 1,
    },
    id: false,
    _id: false,
  },
  { toJSON: { getters: true } }
);

const saleSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    emailAddress: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    cartItems: [cartItem],
    orderTotal: {
      type: Decimal128,
      default: 0,
      get: getPrice,
    },
    status: {
      type: String,
      required: true,
      default: "for sync",
    },
    refId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    salt: String,
    QRcode: Object,
    paymentDetails: {
      option: {
        type: ObjectId,
        ref: "PaymentOption",
      },
      amountPaid: {
        type: Decimal128,
        default: 0,
        get: getPrice,
      },
      referenceNumber: String,
      status: String,
    },
    meta: Object,
    expiryDate: String,
    id: false,
  },
  { timestamps: true, toJSON: { getters: true } }
);

module.exports = mongoose.model("Sale", saleSchema);

const Sale = require("../models/sale");
const PaymentOption = require("../models/paymentOption");
const { generateAccessPass, sendAR } = require("../controllers/sale");

exports.paymayaSuccess = async (req, res) => {
  const { id, status, requestReferenceNumber } = req.body;
  const option = "paymaya";
  const sale = await Sale.findOne({ refId: requestReferenceNumber }).exec();
  const pOption = await PaymentOption.findOne({ slug: option })
    .select("_id")
    .exec();

  sale.status = status;
  sale.paymentDetails = {
    option: await pOption._id,
    referenceNumber: requestReferenceNumber,
    status: status,
  };

  sale.save((err, result) => {
    res.json({ status: status, message: "Paymaya payment processed" });

    //send Acknowledgement receipt
    if (status == "success" || status == "PAYMENT_SUCCESS") {
      generateAccessPass(result, result.cartItems);
      sendAR(result.refId);
    }
  });
};

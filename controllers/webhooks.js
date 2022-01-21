const Sale = require("../models/sale");
const PaymentOption = require("../models/paymentOption");
const { generateAccessPass, sendAR } = require("../controllers/sale");

exports.paymayaPaymentSuccess = async (req, res) => {
  console.log("TRIGGERING WEBHOOK: PAYMAYA PAYMENT SUCCESS");
  console.log("PAYLOAD: ", req.body);
  const { status, requestReferenceNumber } = req.body;
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
    res
      .status(200)
      .json({ status: status, message: "Paymaya payment processed" });

    //send Acknowledgement receipt
    if (status == "success" || status == "PAYMENT_SUCCESS") {
      console.log("GENERATING ACCESS PASS");
      generateAccessPass(result, result.cartItems);
      console.log("SENDING ACKNOWLEDGEMENT RECEIPT");
      sendAR(result.refId);
    }
  });
};

exports.paymayaPaymentFailed = async (req, res) => {
  res.status(200).json({
    function: "PaymayaPaymentFailed",
    resPayload: req.body,
    params: req.params,
  });
};

exports.paymayaPaymentExpired = async (req, res) => {
  res.status(200).json({
    function: "PaymayaPaymentExpired",
    resPayload: req.body,
    params: req.params,
  });
};

exports.paymayaAuthorized = async (req, res) => {
  res.status(200).json({
    function: "PaymayaAuthorized",
    resPayload: req.body,
    params: req.params,
  });
};

exports.paymayaCheckoutSuccess = async (req, res) => {
  res.status(200).json({
    function: "PaymayaCheckoutSuccess",
    resPayload: req.body,
    params: req.params,
  });
};

exports.paymayaCheckoutFailure = async (req, res) => {
  res.status(200).json({
    function: "PaymayaCheckoutFailure",
    resPayload: req.body,
    params: req.params,
  });
};

exports.paymayaCheckoutDropout = async (req, res) => {
  res.status(200).json({
    function: "PaymayaCheckoutDropout",
    resPayload: req.body,
    params: req.params,
  });
};

exports.dragonPaySuccess = async (req, res) => {
  console.log("DRAGONPAY DATA CALLBACK: ");
  res.setHeader("Content-Type", "text/plain");
  res.send("result=OK");
};

exports.dragonPayReturn = async (req, res) => {
  console.log("DRAGONPAY RETURN: ", req);
  res.redirect(
    `${process.env.WEBSITE_URL}/?payment=success?refid=${req.params.txnid}}`
  );
};

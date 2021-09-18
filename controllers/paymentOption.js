const slugify = require("slugify");
const PaymentOption = require("../models/paymentOption");

exports.create = (req, res) => {
  const { name } = req.body;
  const slug = slugify(name).toLowerCase();

  let paymentOption = new PaymentOption();

  paymentOption.name = name;
  paymentOption.slug = slug;

  paymentOption.save((err, result) => {
    if (err) {
      return res.status(400).json({
        error: "error occured",
      });
    }
    res.json(result);
  });
};

exports.read = (req, res) => {
  PaymentOption.findOne({ slug: req.params.slug })
    .select("name status")
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "error occured",
          message: err,
        });
      }
      res.json(data);
    });
};

exports.list = (req, res) => {
  PaymentOption.find().exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: "error occured",
        message: err,
      });
    }
    res.json(data);
  });
};

exports.update = async (req, res) => {
  const { slug, name, status } = req.body;

  const paymentOption = await PaymentOption.findOne({ slug: slug }).exec();

  paymentOption.name = name;
  paymentOption.status = status;

  paymentOption.save((err, result) => {
    if (err) {
      return res.status(400).json({
        error: "error occured",
        message: err,
      });
    }
    res.json({ result, status: "success" });
  });
};

exports.remove = async (req, res) => {
  const { slug } = req.body;

  PaymentOption.findOneAndDelete({ slug }).exec(async (err, result) => {
    if (err) {
      return res.status(400).json({
        error: "error occured",
        message: err,
      });
    }
    
    res.json({ success: "Payment Option deleted successfully" });
  });
};

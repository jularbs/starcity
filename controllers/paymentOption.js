const slugify = require("slugify");
const PaymentOption = require("../models/paymentOption");

const { createEntry } = require("../controllers/auditTrail");
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
    createEntry(
      req.profile.name,
      "Created New Payment Option",
      { name: name },
      req
    );
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
    createEntry(
      req.profile.name,
      `Updated Payment Option ${slug}`,
      { name: name },
      req
    );
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
    createEntry(req.profile.name, `Deleted Payment Option ${slug}`, {}, req);
  });
};

exports.toggleStatus = async (req, res) => {
  const { _id } = req.body;
  let paymentOption = await PaymentOption.findOne({ _id }).exec();
  paymentOption.status = !paymentOption.status;

  paymentOption.save((err, result) => {
    if (err) res.json({ error: "Unable to toggle payment option status." });
    res.json({ result });
    createEntry(
      req.profile.name,
      `Deleted Payment Option ${paymentOption.name}`,
      {},
      req
    );
  });
};

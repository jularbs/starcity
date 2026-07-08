const slugify = require("slugify");
const PaymentOption = require("../models/paymentOption");
const { createEntry } = require("../controllers/auditTrail");

exports.create = async (req, res) => {
  const { name } = req.body;
  const slug = slugify(name).toLowerCase();

  try {
    let paymentOption = new PaymentOption();
    paymentOption.name = name;
    paymentOption.slug = slug;

    const result = await paymentOption.save();
    createEntry(
      req.profile.name,
      "Created New Payment Option",
      { name: name },
      req
    );
    return res.json(result);

  } catch (err) {
    return res.status(400).json({
      error: "error occured",
      message: err,
    });
  }
};

exports.read = async (req, res) => {
  try {
    const data = await PaymentOption.findOne({ slug: req.params.slug })
      .select("name status")
      .exec();

    return res.json(data);
  } catch (err) {
    return res.status(400).json({
      error: "error occured",
      message: err,
    });
  }
};

exports.list = async (req, res) => {
  const { f } = req.query;
  if (f) {
    try {
      const data = await PaymentOption.find({ status: true }).exec();
      res.json(data);
    } catch (err) {
      return res.status(400).json({
        error: "error occured",
        message: err,
      });
    }

  } else {
    try {
      const data = await PaymentOption.find().exec();
      res.json(data);
    } catch (err) {
      return res.status(400).json({
        error: "error occured",
        message: err,
      });
    }
  }
};

exports.update = async (req, res) => {
  try {
    const { slug, name, status } = req.body;

    const paymentOption = await PaymentOption.findOne({ slug: slug }).exec();
    paymentOption.name = name;
    paymentOption.status = status;

    const result = await paymentOption.save();
    createEntry(
      req.profile.name,
      `Updated Payment Option ${slug}`,
      { name: name },
      req
    );
    res.json({ result, status: "success" });

  } catch (err) {
    return res.status(400).json({
      error: "error occured",
      message: err,
    });
  }

};

exports.remove = async (req, res) => {
  try {
    const { slug } = req.body;

    PaymentOption.findOneAndDelete({ slug }).exec();
    res.json({ success: "Payment Option deleted successfully" });
    createEntry(req.profile.name, `Deleted Payment Option ${slug}`, {}, req);
  } catch (err) {
    return res.status(400).json({
      error: "error occured",
      message: err,
    });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const { _id } = req.body;
    let paymentOption = await PaymentOption.findOne({ _id }).exec();
    paymentOption.status = !paymentOption.status;

    const result = await paymentOption.save();
    createEntry(
      req.profile.name,
      `Toggled Payment Option ${paymentOption.name}`,
      {},
      req
    );
    return res.json({ data: result, success: "Payment Option toggled successfully!" });
  } catch (err) {
    return res.status(400).json({ error: "Unable to toggle payment option status." });
  }
};

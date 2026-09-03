import slugify from "slugify";
import PaymentOption from "./paymentOption.model.js";
import { createEntry } from "../auditTrail/auditTrail.controller.js";
export const create = async (req, res) => {
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

export const read = async (req, res) => {
  try {
    const data = await PaymentOption.findOne({ slug: req.params.slug, deletedAt: null })
      .select("name status")
      .exec();

    if (!data) {
      return res.status(404).json({
        error: "Payment Option not found",
      });
    }

    return res.json(data);
  } catch (err) {
    return res.status(400).json({
      error: "error occured",
      message: err,
    });
  }
};

export const list = async (req, res) => {
  const { f } = req.query;
  if (f) {
    try {
      const data = await PaymentOption.find({ status: true, deletedAt: null }).exec();
      res.json(data);
    } catch (err) {
      return res.status(400).json({
        error: "error occured",
        message: err,
      });
    }

  } else {
    try {
      const data = await PaymentOption.find({ deletedAt: null }).exec();
      res.json(data);
    } catch (err) {
      return res.status(400).json({
        error: "error occured",
        message: err,
      });
    }
  }
};

export const update = async (req, res) => {
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

export const remove = async (req, res) => {
  try {
    const { slug } = req.body;
    if (!slug) {
      return res.status(400).json({
        error: "Payment Option slug is required",
      });
    }

    const paymentOption = await PaymentOption.findOne({ slug }).exec();
    if (!paymentOption) {
      return res.status(404).json({
        error: "Payment Option not found",
      });
    }

    paymentOption.deletedAt = new Date();
    await paymentOption.save();
    res.json({ success: "Payment Option deleted successfully" });
    createEntry(req.profile.name, `Deleted Payment Option ${slug}`, {}, req);
  } catch (err) {
    return res.status(400).json({
      error: "error occured",
      message: err,
    });
  }
};

export const toggleStatus = async (req, res) => {
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

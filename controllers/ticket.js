const Ticket = require("../models/ticket");
const slugify = require("slugify");

const { createEntry } = require("../controllers/auditTrail");

exports.create = (req, res) => {
  const { name, code, shortDescription, price, details } = req.body;

  const slug = slugify(name).toLowerCase();

  let ticket = new Ticket();

  ticket.name = name;
  ticket.slug = slug;
  ticket.itemCode = code;

  ticket.price = price;
  ticket.shortDescription = shortDescription;
  ticket.details = details;

  ticket.save((err, result) => {
    if (err) {
      return res.status(400).json({
        error: "error occured",
      });
    }
    res.json(result);
    createEntry(req.profile.name, `Created New Ticket ${name}`, result, req);
  });
};

exports.read = (req, res) => {
  Ticket.findOne({ slug: req.params.slug })
    .select("name description slug price status")
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
  const { f } = req.query;

  if (f) {
    Ticket.find({ status: true }).exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "error occured",
          message: err,
        });
      }
      res.json(data);
    });
  } else {
    Ticket.find().exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "error occured",
          message: err,
        });
      }
      res.json(data);
    });
  }
};

exports.update = async (req, res) => {
  const { name, _id, shortDescription, price, details } = req.body;

  const ticket = await Ticket.findOne({ _id }).exec();

  ticket.name = name;
  ticket.shortDescription = shortDescription;
  ticket.price = price;
  ticket.details = details;

  ticket.save((err, result) => {
    if (err) {
      return res.status(400).json({
        error: "error occured",
        message: err,
      });
    }
    res.json({ result, status: "success" });
    createEntry(req.profile.name, `Updated ticket ${name}`, result, req);
  });
};

exports.remove = async (req, res) => {
  const { _id } = req.body;

  Ticket.findOneAndDelete({ _id }).exec(async (err, result) => {
    if (err) {
      return res.status(400).json({
        error: "error occured",
        message: err,
      });
    }
    res.json({ success: "Ticket deleted successfully" });
    createEntry(req.profile.name, `Deleted ticket ${_id}`, {}, req);
  });
};

exports.toggleStatus = async (req, res) => {
  const { _id } = req.body;

  let ticket = await Ticket.findOne({ _id }).exec();
  ticket.status = !ticket.status;

  ticket.save((err, result) => {
    if (err) res.json({ error: "Unable to toggle ticket status." });
    res.json({ result });
    createEntry(
      req.profile.name,
      `Toggled ticket ${ticket.name}`,
      { status: result.status },
      req
    );
  });
};

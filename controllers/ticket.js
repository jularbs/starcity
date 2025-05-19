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

    createEntry(req.profile.name, `Created New Ticket ${name}`, result, req);
    return res.json({ success: "Ticket created successfully", data: result });
  });
};

exports.read = (req, res) => {
  Ticket.findOne({ slug: req.params.slug })
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
  console.log("Updating ticket")
  const { name, _id, shortDescription, price, details, code } = req.body;

  const ticket = await Ticket.findOne({ _id }).exec();

  ticket.name = name;
  ticket.itemCode = code;
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
    res.json({ result, success: "Ticket updated successfully!" });
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

  if (!ticket)
    return res.status(400).json({ error: "Ticket not found" });

  ticket.status = !ticket.status;

  ticket.save((err, result) => {
    if (err) return res.status(400).json({ error: "Unable to toggle ticket status." });
    createEntry(
      req.profile.name,
      `Toggled ticket ${ticket.name}`,
      { status: result.status },
      req
    );
    return res.json({
      success: "Ticket toggled successfully",
      data: result
    });

  });
};

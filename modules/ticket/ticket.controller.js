const Ticket = require("./ticket.model");
const slugify = require("slugify");

const { createEntry } = require("../auditTrail/auditTrail.controller");

exports.create = async (req, res) => {
  const { name, code, shortDescription, price, details } = req.body;

  const slug = slugify(name).toLowerCase();

  let ticket = new Ticket();

  ticket.name = name;
  ticket.slug = slug;
  ticket.itemCode = code;

  ticket.price = price;
  ticket.shortDescription = shortDescription;
  ticket.details = details;

  try {
    const result = await ticket.save();
    createEntry(req.profile.name, `Created New Ticket ${name}`, result, req);
    return res.json({ success: "Ticket created successfully", data: result });
  } catch (err) {
    return res.status(400).json({
      error: "error occured",
      message: err,
    });
  }
};

exports.read = async (req, res) => {
  try {
    const data = await Ticket.findOne({ slug: req.params.slug, deletedAt: null }).exec();

    if (!data) {
      return res.status(404).json({
        error: "Ticket not found",
      });
    }

    res.json(data);
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
      const data = await Ticket.find({ status: true, deletedAt: null }).exec();
      res.json(data);
    } catch (err) {
      return res.status(400).json({
        error: "error occured",
        message: err,
      });
    }
  } else {
    try {
      const data = await Ticket.find({ deletedAt: null }).exec();
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
  console.log("Updating ticket")
  const { name, _id, shortDescription, price, details, code } = req.body;

  const ticket = await Ticket.findOne({ _id }).exec();

  ticket.name = name;
  ticket.itemCode = code;
  ticket.shortDescription = shortDescription;
  ticket.price = price;
  ticket.details = details;

  try {
    const result = await ticket.save();
    res.json({ result, success: "Ticket updated successfully!" });
    createEntry(req.profile.name, `Updated ticket ${name}`, result, req);
  } catch (err) {
    return res.status(400).json({
      error: "error occured",
      message: err,
    });
  }
};

exports.remove = async (req, res) => {
  const { _id } = req.body;

  try {
    if (!_id) {
      return res.status(400).json({
        error: "Ticket ID is required",
      });
    }

    const ticket = await Ticket.findOne({ _id }).exec();

    if (!ticket) {
      return res.status(404).json({
        error: "Ticket not found",
      });
    }

    ticket.deletedAt = new Date();
    await ticket.save();
    res.json({ success: "Ticket deleted successfully" });
    createEntry(req.profile.name, `Deleted ticket ${_id}`, {}, req);
  } catch (err) {
    return res.status(400).json({
      error: "error occured",
      message: err,
    });
  }
};

exports.toggleStatus = async (req, res) => {
  const { _id } = req.body;

  let ticket = await Ticket.findOne({ _id }).exec();

  if (!ticket)
    return res.status(400).json({ error: "Ticket not found" });

  ticket.status = !ticket.status;

  try {
    const result = await ticket.save();
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
  } catch (err) {
    return res.status(400).json({ error: "Unable to toggle ticket status." });
  }
};

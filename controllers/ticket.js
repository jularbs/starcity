const Ticket = require("../models/ticket");
const slugify = require("slugify");

exports.create = (req, res) => {
  const { name, description, price, status } = req.body;

  const slug = slugify(name).toLowerCase();

  let ticket = new Ticket();

  ticket.name = name;
  ticket.description = description;
  ticket.slug = slug;

  ticket.price = price;
  ticket.status = status;

  ticket.save((err, result) => {
    if (err) {
      return res.status(400).json({
        error: "error occured",
      });
    }
    res.json(result);
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
  Ticket.find().exec((err, data) => {
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
  const { name, slug, description, price, status } = req.body;

  const ticket = await Ticket.findOne({ slug: slug }).exec();

  ticket.name = name;
  ticket.description = description;

  ticket.price = price;
  ticket.status = status;

  ticket.save((err, result) => {
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

  Ticket.findOneAndDelete({ slug }).exec(async (err, result) => {
    if (err) {
      return res.status(400).json({
        error: "error occured",
        message: err,
      });
    }
    res.json({ success: "Ticket deleted successfully" });
  });
};

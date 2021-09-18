const slugify = require("slugify");
const Option = require("../models/option");

exports.create = (req, res) => {
  const { name, value, meta } = req.body;
  const slug = slugify(name).toLowerCase();

  let option = new Option();

  option.name = name;
  option.slug = slug;
  option.value = value;
  option.meta = meta;

  option.save((err, result) => {
    if (err) {
      return res.status(400).json({
        error: "error occured",
      });
    }
    res.json(result);
  });
};

exports.read = (req, res) => {
  Option.findOne({ slug: req.params.slug })
    .select("name value meta")
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
  Option.find().exec((err, data) => {
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
  const { slug, name, value, meta } = req.body;

  const option = await Option.findOne({ slug: slug }).exec();

  option.name = name;
  option.value = value;
  option.meta = meta;

  option.save((err, result) => {
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

  Option.findOneAndDelete({ slug }).exec(async (err, result) => {
    if (err) {
      return res.status(400).json({
        error: "error occured",
        message: err,
      });
    }

    res.json({ success: "Payment Option deleted successfully" });
  });
};

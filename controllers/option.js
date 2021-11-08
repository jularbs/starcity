const slugify = require("slugify");
const Option = require("../models/option");
const { createEntry } = require("../controllers/auditTrail");

exports.create = async (req, res) => {
  const { name, value, meta } = req.body;

  let option = await Option.findOne({ name }).exec();

  if (option) {
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

      createEntry(
        req.profile.name,
        `Option ${name} updated`,
        { value: req.value },
        req
      );
    });
  } else {
    const slug = slugify(name).toLowerCase();

    let newOption = new Option();

    newOption.name = name;
    newOption.slug = slug;
    newOption.value = value;
    newOption.meta = meta;

    newOption.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: "error occured",
        });
      }
      res.json(result);
      createEntry(
        req.profile.name,
        `Option ${name} created`,
        {
          value: req.value,
        },
        req
      );
    });
  }
};

exports.read = (req, res) => {
  Option.findOne({ name: req.params.name })
    .select("name value")
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
  const { keys } = req.query;
  console.log(keys);
  if (!keys) {
    Option.find()
      .select("name value")
      .exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: "error occured",
            message: err,
          });
        }
        res.json(data);
      });
  } else {
    Option.find()
      .select("name value")
      .where("name")
      .in(keys)
      .exec((err, options) => {
        if (err) res.status(400).json({ error: "Unable to retrieve options" });

        res.json(options);
      });
  }
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

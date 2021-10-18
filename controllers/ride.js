const Ride = require("../models/ride");
const slugify = require("slugify");

exports.create = (req, res) => {
  const { name, description, heightRequirements, categoryId } = req.body;

  const slug = slugify(name).toLowerCase();

  let ride = new Ride();

  ride.name = name;
  ride.description = description;
  ride.slug = slug;

  ride.heightRequirements = heightRequirements;
  ride.rideCategoryId = categoryId;

  ride.save(async (err, result) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to add new ride/attraction. Please try again later",
      });
    }
    const r = await result.populate("rideCategoryId", "name").execPopulate();
    res.status(200).json(r);
  });
};

exports.read = (req, res) => {
  Ride.findOne({ slug: req.params.slug })
    .select("name description slug status heightRequirements")
    .populate("rideCategoryId", "name")
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
  Ride.find()
    .populate("rideCategoryId", "name")
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

exports.update = async (req, res) => {
  const { name, slug, description, heightRequirements, categoryId } = req.body;

  const ride = await Ride.findOne({ slug: slug }).exec();

  ride.name = name;
  ride.description = description;
  ride.slug = slug;

  ride.heightRequirements = heightRequirements;
  ride.rideCategoryId = categoryId;

  ride.save((err, result) => {
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

  Ride.findOneAndDelete({ slug }).exec(async (err, result) => {
    if (err) {
      return res.status(400).json({
        error: "error occured",
        message: err,
      });
    }
    res.json({ success: "Ride deleted successfully" });
  });
};

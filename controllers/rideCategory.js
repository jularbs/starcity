const RideCategory = require("../models/rideCategory.js");
const slugify = require("slugify");
const formidable = require("formidable");

const { createEntry } = require("../controllers/auditTrail");

exports.create = (req, res) => {
  const { name, description } = req.body;

  const slug = slugify(name).toLowerCase();

  let rideCategory = new RideCategory();

  rideCategory.name = name;
  rideCategory.description = description;
  rideCategory.slug = slug;

  rideCategory.save((err, result) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to add new ride category. Please try again!",
      });
    }

    res.json(result);
    createEntry(req.profile.name, `Created new Ride Category`, result, req);
  });
};

exports.read = (req, res) => {
  Option.findOne({ slug: req.params.slug })
    .select("name description slug image meta")
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
  RideCategory.find().exec((err, data) => {
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
  const { slug, name, description } = req.body;

  const rideCategory = await RideCategory.findOne({ slug: slug }).exec();

  rideCategory.name = name;
  rideCategory.description = description;

  rideCategory.save((err, result) => {
    if (err) {
      return res.status(400).json({
        error: "error occured",
        message: err,
      });
    }
    res.json({ result, status: "success" });
    createEntry(req.profile.name, `Updated Ride Category ${name}`, result, req);
  });
};

exports.remove = async (req, res) => {
  const { slug } = req.body;

  RideCategory.findOneAndDelete({ slug }).exec(async (err, result) => {
    if (err) {
      return res.status(400).json({
        error: "error occured",
        message: err,
      });
    }

    const data = await RideCategory.find().exec();

    res.json({ success: "Ride Category deleted successfully" });
    createEntry(req.profile.name, `Deleted Ride Category`, { slug }, req);
  });
};

const Ride = require("../models/ride");
const formidable = require("formidable");
const slugify = require("slugify");
const { uploadFile } = require("../helpers/s3uploader.js");
const { createEntry } = require("../controllers/auditTrail");
exports.create = (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    const { name, description, heightRequirements, categoryId, status } =
      fields;
    const { image } = files;

    const slug = slugify(name).toLowerCase();

    if (image) {
      if (image.size > 1000000) {
        return res.status(400).json({
          error: "Image too large. ( > 1MB ).",
        });
      }

      var date = new Date();
      var month = date.getUTCMonth() + 1; //months from 1-12
      var year = date.getUTCFullYear();

      const imageInfo = await uploadFile(
        image,
        `ride/${year}/${month}/${slug}`,
        600
      );
      if (imageInfo.location && imageInfo.bucket && imageInfo.key) {
        let ride = new Ride();
        ride.name = name;
        ride.description = description;
        ride.slug = slug;
        ride.status = status;
        ride.heightRequirements = heightRequirements;
        ride.rideCategoryId = categoryId;
        ride.media = imageInfo;

        ride.save(async (err, result) => {
          if (err) {
            return res.status(400).json({
              error:
                "Failed to add new ride/attraction. Please try again later",
            });
          }
          const r = await result
            .populate("rideCategoryId", "name")
            .execPopulate();
          res.status(200).json({ data: r, success: "Ride added successfully" });

          createEntry(req.profile.name, `Create new ride`, { result }, req);
        });
      } else {
        res
          .status(400)
          .json({ error: "Unable to upload image. Please try again later." });
      }
    } else {
      res.status(400).json({ error: "Image is required" });
    }
  });
};

exports.read = (req, res) => {
  Ride.findOne({ slug: req.params.slug })
    .select("name description slug status heightRequirements media")
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
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    const { name, slug, description, heightRequirements, status, categoryId } =
      fields;
    const { image } = files;

    const ride = await Ride.findOne({ slug: slug }).exec();

    if (ride) {
      if (image) {
        if (image.size > 1000000) {
          return res.status(400).json({
            error: "Image too large. ( > 1MB ).",
          });
        }

        var date = new Date();
        var month = date.getUTCMonth() + 1; //months from 1-12
        var year = date.getUTCFullYear();

        const imageInfo = await uploadFile(
          image,
          `ride/${year}/${month}/${slug}`
        );
        ride.media = imageInfo;
      }

      ride.name = name;
      ride.description = description;
      ride.status = status;
      ride.heightRequirements = heightRequirements;
      ride.rideCategoryId = categoryId;

      ride.save(async (err, result) => {
        if (err) {
          return res.status(400).json({
            error: "Unable to update ride/attraction. Please try again later.",
            message: err,
          });
        }
        const r = await result
          .populate("rideCategoryId", "name _id")
          .execPopulate();
        createEntry(req.profile.name, `Updated ride ${r.name}`, {}, req);

        return res.json({ result: r, success: "Ride/Attraction updated successfully!" });
      });
    } else {
      return res.status(400).json({
        error: "Ride/Attraction not found. Please try refreshing the page to try again.",
        message: err,
      });
    }
  });
};

exports.remove = async (req, res) => {
  const { slug } = req.params;

  Ride.findOneAndDelete({ slug }).exec(async (err, result) => {
    if (err) {
      return res.status(400).json({
        error: "Unable to delete ride. Please try again later",
        message: err,
      });
    }

    createEntry(req.profile.name, `Deleted ride ${slug}`, { slug }, req);

    //TODO: DELETE IMAGE
    return res.json({ success: "Ride deleted successfully" });
  });
};

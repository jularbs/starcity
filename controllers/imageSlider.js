const Post = require("../models/post");
const ImageSlider = require("../models/imageSlider");

const slugify = require("slugify");
const formidable = require("formidable");
const {
  uploadTos3withKey,
  deleteObjectFromS3,
} = require("../helpers/s3uploader");

const { createEntry } = require("../controllers/auditTrail");

const { zonedTimeToUtc } = require("date-fns-tz");

exports.create = (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    const { order, name, startDate, endDate } = fields;
    const { image } = files;

    if (!name || !name.length) {
      return res.status(400).json({
        error: "Name identifier is required",
      });
    }

    if (!startDate || !startDate.length) {
      return res.status(400).json({
        error: "Start date is required",
      });
    }

    if (!endDate || !endDate.length) {
      return res.status(400).json({
        error: "End date is required",
      });
    }

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

      const imageInfo = await uploadTos3withKey(
        image,
        `image-slider/${year}/${month}/${slug}`
      );
      if (imageInfo.location && imageInfo.bucket && imageInfo.key) {
        let is = new ImageSlider();
        is.order = order;
        is.name = name;
        is.slug = slug;
        is.startDate = zonedTimeToUtc(startDate, "Asia/Manila");
        is.endDate = zonedTimeToUtc(endDate, "Asia/Manila");
        is.image = imageInfo;
        is.status = false;

        is.save((err, result) => {
          if (err) {
            res.status(400).json({
              erorr:
                "Failed to add item in image stlider. Please try again later.",
            });
          }
          res.json(result);
          createEntry(
            req.profile.name,
            "Created new Image Slider Item",
            { ...result, image: null },
            req
          );
        });
      } else {
        res
          .status(400)
          .json({ error: "Error on uploading image to Amazon S3" });
      }
    } else {
      return res.status(400).json({
        error: "Image is required",
      });
    }
  });
};

exports.read = (req, res) => {
  const { slug } = req.params;
  Post.findOne({ slug }).exec((err, result) => {
    res.json(result);
  });
};

exports.list = (req, res) => {
  ImageSlider.find({}).exec((err, result) => {
    res.json(result);
  });
};

exports.update = async (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    const { order, name, startDate, endDate, slug } = fields;
    const { image } = files;
    let is = await ImageSlider.findOne({ slug: slug }).exec();
    is.order = order;
    is.name = name;
    is.startDate = zonedTimeToUtc(startDate, "Asia/Manila");
    is.endDate = zonedTimeToUtc(endDate, "Asia/Manila");

    if (image) {
      if (image.size > 1000000) {
        return res.status(400).json({
          error: "Image too large. ( > 1MB ).",
        });
      }

      var date = new Date();
      var month = date.getUTCMonth() + 1; //months from 1-12
      var year = date.getUTCFullYear();

      const imageInfo = await uploadTos3withKey(
        image,
        `image-slider/${year}/${month}/${slug}`
      );
      if (imageInfo.location && imageInfo.bucket && imageInfo.bucket) {
        is.image = imageInfo;
      } else {
        res
          .status(400)
          .json({ error: "Error on uploading image to Amazon S3" });
      }
    }

    is.save((err, result) => {
      if (err) {
        res.status(400).json({
          erorr: "Failed to add item in image stlider. Please try again later.",
        });
      }
      res.json(result);
      createEntry(
        req.profile.name,
        `Updated Image Slider Item ${slug}`,
        { ...result, image: null },
        req
      );
    });
  });
};

exports.remove = async (req, res) => {
  const { slug } = req.body;

  const data = await ImageSlider.deleteOne({ slug }).exec();
  //TODO: DELETE IMAGE
  res.json({ message: "Post deleted successfully" });
  createEntry(req.profile.name, `Deleted Image Slider Item ${slug}`, {}, req);
};

exports.toggleStatus = async (req, res) => {
  const { _id } = req.body;
  let is = await ImageSlider.findOne({ _id }).exec();
  is.status = !is.status;

  is.save((err, result) => {
    if (err)
      res.status(400).json({ error: "Unable to toggle Image Slider status." });
    res.json({ result });
    createEntry(
      req.profile.name,
      `Toggled Image Slider Item ${result.name}`,
      { status: result.status },
      req
    );
  });
};

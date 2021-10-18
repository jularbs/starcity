const Post = require("../models/post");
const ImageSlider = require("../models/imageSlider");

const slugify = require("slugify");
const { smartTrim } = require("../helpers/commonFunctions");
const { stripHtml } = require("string-strip-html");
const formidable = require("formidable");
const {
  uploadTos3withKey,
  deleteObjectFromS3,
} = require("../helpers/s3uploader");

exports.create = (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    const { name, startDate, endDate } = fields;
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

      const imageInfo = await uploadTos3withKey(image, `image-slider/${slug}`);
      if (imageInfo.location && imageInfo.bucket && imageInfo.bucket) {
        let is = new ImageSlider();
        is.name = name;
        is.slug = slug;
        is.startDate = startDate;
        is.endDate = endDate;
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
    const { name, startDate, endDate, slug } = fields;
    const { image } = files;
    let is = await ImageSlider.findOne({ slug: slug }).exec();
    console.log(is);
    is.name = name;
    is.startDate = startDate;
    is.endDate = endDate;

    if (image) {
      if (image.size > 1000000) {
        return res.status(400).json({
          error: "Image too large. ( > 1MB ).",
        });
      }

      const imageInfo = await uploadTos3withKey(image, `image-slider/${slug}`);
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
    });
  });
};

exports.remove = async (req, res) => {
  const { slug } = req.body;

  const data = await ImageSlider.deleteOne({ slug }).exec();
  res.json({ message: "Post deleted successfully" });
};

exports.toggleStatus = async (req, res) => {
  const { _id } = req.body;
  let is = await ImageSlider.findOne({ _id }).exec();
  is.status = !is.status;

  is.save((err, result) => {
    if (err)
      res.status(400).json({ error: "Unable to toggle Image Slider status." });
    res.json({ result });
  });
};

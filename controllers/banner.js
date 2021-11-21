const Banner = require("../models/banner");

const slugify = require("slugify");
const { smartTrim } = require("../helpers/commonFunctions");
const { stripHtml } = require("string-strip-html");
const formidable = require("formidable");
const {
  uploadTos3withKey,
  deleteObjectFromS3,
} = require("../helpers/s3uploader");

const { createEntry } = require("../controllers/auditTrail");

exports.create = (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    const { name, link, startDate, endDate, sizeCategory } = fields;
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

      const imageInfo = await uploadTos3withKey(image, `banners/${slug}`);
      if (imageInfo.location && imageInfo.bucket && imageInfo.key) {
        let b = new Banner();
        b.name = name;
        b.link = link;
        b.slug = slug;
        b.startDate = startDate;
        b.endDate = endDate;
        b.image = imageInfo;
        b.status = false;
        b.sizeCategory = sizeCategory;

        b.save((err, result) => {
          if (err) {
            console.log(err);
            res.status(400).json({
              erorr: "Failed to add banner. Please try again later.",
            });
          }
          res.json(result);
          createEntry(
            req.profile.name,
            "Created new banner",
            {
              name,
              startDate,
              endDate,
              sizeCategory,
            },
            req
          );
        });
      } else {
        console.log("error at image upload");

        res
          .status(400)
          .json({ error: "Error on uploading image to Amazon S3" });
      }
    } else {
      console.log("error at no image");

      return res.status(400).json({
        error: "Image is required",
      });
    }
  });
};

exports.read = (req, res) => {
  const { slug } = req.params;
  Banner.findOne({ slug }).exec((err, result) => {
    res.json(result);
  });
};

exports.list = (req, res) => {
  Banner.find({}).exec((err, result) => {
    res.json(result);
  });
};

exports.update = async (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    const { name, link, startDate, endDate, slug, sizeCategory } = fields;
    const { image } = files;
    let b = await Banner.findOne({ slug: slug }).exec();
    b.name = name;

    b.startDate = startDate;
    b.endDate = endDate;
    b.sizeCategory = sizeCategory;
    b.link = link;

    if (image) {
      if (image.size > 1000000) {
        return res.status(400).json({
          error: "Image too large. ( > 1MB ).",
        });
      }

      const imageInfo = await uploadTos3withKey(image, `banners/${slug}`);
      if (imageInfo.location && imageInfo.bucket && imageInfo.bucket) {
        b.image = imageInfo;
      } else {
        res
          .status(400)
          .json({ error: "Error on uploading image to Amazon S3" });
      }
    }

    b.save((err, result) => {
      if (err) {
        res.status(400).json({
          erorr: "Failed to add banner. Please try again later.",
        });
      }
      res.json(result);
      createEntry(
        req.profile.name,
        `Updated banner ${slug}`,
        {
          slug,
          name,
          startDate,
          endDate,
          sizeCategory,
        },
        req
      );
    });
  });
};

exports.remove = async (req, res) => {
  const { slug } = req.body;

  const data = await Banner.deleteOne({ slug }).exec();
  res.json({ message: "Banner deleted successfully" });
  //TODO: DELETE IMAGE IN S3
  createEntry(req.profile.name, `Deleted banner ${slug}`, {}, req);
};

exports.toggleStatus = async (req, res) => {
  const { _id } = req.body;
  let b = await Banner.findOne({ _id }).exec();
  b.status = !b.status;

  b.save((err, result) => {
    if (err) res.status(400).json({ error: "Unable to toggle banner status." });
    res.json({ result });
    createEntry(
      req.profile.name,
      `Toggled banner status ${result.name}`,
      { status: result.status },
      req
    );
  });
};

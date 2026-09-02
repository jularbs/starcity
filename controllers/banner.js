const Banner = require("../models/banner");

const slugify = require("slugify");
const formidable = require("formidable");
const {
  uploadFile,
} = require("../helpers/s3uploader");

const { createEntry } = require("../controllers/auditTrail");

const { zonedTimeToUtc } = require("date-fns-tz");

exports.create = async (req, res) => {
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

      var date = new Date();
      var month = date.getUTCMonth() + 1; //months from 1-12
      var year = date.getUTCFullYear();

      let imageInfo;

      try {
        imageInfo = await uploadFile(
          image,
          `banners/${year}/${month}/${slug}`
        );
      } catch (err) {
        console.log(err);
        return res.status(400).json({
          error: "Failed to add banner due to failed upload. Please try again later.",
        });
      }

      if (imageInfo.location && imageInfo.bucket && imageInfo.key) {
        try {
          let b = new Banner();
          b.name = name;
          b.link = link;
          b.slug = slug;
          b.startDate = zonedTimeToUtc(startDate, "Asia/Manila");
          b.endDate = zonedTimeToUtc(endDate, "Asia/Manila");
          b.image = imageInfo;
          b.status = false;
          b.sizeCategory = sizeCategory;

          const banner = await b.save();
          res.json(banner);
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
        } catch (err) {
          console.log(err);
          return res.status(400).json({
            error: "Failed to add banner. Please try again later.",
          });
        }
      } else {
        console.log("error at image upload");
        return res
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

exports.read = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await Banner.findOne({ slug }).exec();
    res.json(result);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Error on getting banner information" });
  }
};

exports.list = async (req, res) => {
  try {
    const result = await Banner.find({}).exec();
    res.json(result);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Error on getting banners list" });
  }
};

exports.update = async (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    const { name, link, startDate, endDate, slug, sizeCategory } = fields;
    const { image } = files;
    let b = await Banner.findOne({ slug: slug }).exec();
    b.name = name;

    b.startDate = zonedTimeToUtc(startDate, "Asia/Manila");
    b.endDate = zonedTimeToUtc(endDate, "Asia/Manila");
    b.sizeCategory = sizeCategory;
    b.link = link;

    if (image) {
      if (image.size > 1000000) {
        return res.status(400).json({
          error: "Image too large. ( > 1MB ).",
        });
      }

      var date = new Date();
      var month = date.getUTCMonth() + 1; //months from 1-12
      var year = date.getUTCFullYear();

      let imageInfo;
      try {
        imageInfo = await uploadFile(
          image,
          `banners/${year}/${month}/${slug}`
        );
      } catch (err) {
        console.log(err);
        return res.status(400).json({ error: "Error on uploading image to Amazon S3" });
      }

      if (imageInfo.location && imageInfo.bucket && imageInfo.key) {
        b.image = imageInfo;
      } else {
        res
          .status(400)
          .json({ error: "Error on uploading image to Amazon S3" });
      }
    }

    try {
      const banner = await b.save();
      res.json(banner);
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
    } catch (err) {
      res.status(400).json({
        error: "Failed to add banner. Please try again later.",
      });
    }
  });
};

exports.remove = async (req, res) => {
  const { slug } = req.body;

  if (!slug) {
    return res.status(400).json({
      error: "Banner slug is required",
    });
  }

  const data = await Banner.deleteOne({ slug }).exec();
  res.json({ message: "Banner deleted successfully" });
  //TODO: DELETE IMAGE IN S3
  createEntry(req.profile.name, `Deleted banner ${slug}`, {}, req);
};

exports.toggleStatus = async (req, res) => {
  const { _id } = req.body;
  let b = await Banner.findOne({ _id }).exec();
  b.status = !b.status;

  try {
    const banner = await b.save();
    res.json({ banner });
    createEntry(
      req.profile.name,
      `Toggled banner status ${banner.name}`,
      { status: banner.status },
      req
    );
  } catch (err) {
    res.status(400).json({ error: "Unable to toggle banner status." });
  }
};

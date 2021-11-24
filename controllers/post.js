const Post = require("../models/post");
const slugify = require("slugify");
const { smartTrim } = require("../helpers/commonFunctions");
const { stripHtml } = require("string-strip-html");
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
    const { title, content, status, publishDate } = fields;
    const { image } = files;

    if (!title || !title.length) {
      return res.status(400).json({
        error: "Title is required",
      });
    }

    const slug = slugify(title).toLowerCase();
    const excerpt = smartTrim(
      stripHtml(content).result.substring(0, 300),
      280,
      " ",
      "..."
    );

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
        `post/${year}/${month}/${slug}`
      );
      if (imageInfo.location && imageInfo.bucket && imageInfo.bucket) {
        let post = new Post();
        post.title = title;
        post.slug = slug;
        post.content = content;
        post.excerpt = excerpt;
        post.featuredImage = imageInfo;
        post.status = status;
        post.publishDate = zonedTimeToUtc(publishDate, "Asia/Manila");

        post.save((err, result) => {
          if (err) {
            res.json({
              erorr: "Failed to save post. Please try again later.",
            });
          }
          res.json(result);
          createEntry(req.profile.name, "Created new post", result, req);
        });
      } else {
        res.json({ error: "Error on uploading image to Amazon S3" });
      }
    } else {
      return res.status(400).json({
        error: "Featured Image is required",
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
  const { skip, limit } = req.query;
  Post.find({})
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .exec(async (err, result) => {
      if (err) {
        console.log(err);
        return res.status(400).json({
          error: "error occured",
          message: err,
        });
      }
      const count = await Post.countDocuments();
      res.json({ data: result, count });
    });
};

exports.update = async (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    const { title, content, slug, status, publishDate } = fields;
    const { image } = files;

    let post = await Post.findOne({ slug }).exec();

    if (image) {
      deleteObjectFromS3(post.featuredImage.key, post.featuredImage.bucket);

      var date = new Date();
      var month = date.getUTCMonth() + 1; //months from 1-12
      var year = date.getUTCFullYear();
      const imageInfo = await uploadTos3withKey(
        image,
        `post/${year}/${month}/${slug}`
      );

      post.featuredImage = imageInfo;
    }

    const excerpt = smartTrim(
      stripHtml(content).result.substring(0, 300),
      280,
      " ",
      "..."
    );
    post.title = title;
    post.slug = slug;
    post.content = content;
    post.excerpt = excerpt;
    post.status = status;
    post.publishDate = zonedTimeToUtc(publishDate, "Asia/Manila");

    post.save((err, result) => {
      if (err) {
        res.status(400).json({
          error: "Error on updating post. Please try again later.",
          payload: err,
        });
      }
      res.json(result);
      createEntry(req.profile.name, `Updated post ${post.title}`, result, req);
    });
  });
};

exports.remove = async (req, res) => {
  const { slug } = req.body;

  const data = await Post.deleteOne({ slug }).exec();
  //TODO: DELETE IMAGE

  res.json({ message: "Post deleted successfully" });
  createEntry(req.profile.name, `Deleted post ${slug}`, {}, req);
};

exports.uploadImage = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.log(err);
      return res.status(400).json({
        error: "There was a problem with uploading the image.",
      });
    }

    if (files.photo) {
      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: "Image too large. ( > 1MB ).",
        });
      }

      var date = new Date();
      var month = date.getUTCMonth() + 1; //months from 1-12
      var year = date.getUTCFullYear();

      const imageInfo = await uploadTos3withKey(
        files.photo,
        `attachments/${year}/${month}`
      );
      if (imageInfo) res.json({ location: imageInfo.location });
    } else {
      return res.status(400).json({
        error: "No image is selected.",
      });
    }
  });
};

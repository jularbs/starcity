import Post from "./post.model.js";
import slugify from "slugify";
import { smartTrim } from "../../helpers/commonFunctions.js";
import { stripHtml } from "string-strip-html";
import formidable from "formidable";
import {
  deleteObjectFromS3,
  uploadFile,
} from "../../helpers/s3uploader.js";
import { createEntry } from "../auditTrail/auditTrail.controller.js";
import dateFnsTz from "date-fns-tz";

const { zonedTimeToUtc } = dateFnsTz;

export const create = async (req, res) => {
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

      let imageInfo;
      try {
        imageInfo = await uploadFile(
          image,
          `post/${year}/${month}/${slug}`
        );
      } catch (err) {
        console.log("Error on upload: ", err);
        return res.status(400).json({ error: "Error on uploading image to Amazon S3" });
      }

      if (imageInfo.location && imageInfo.bucket && imageInfo.bucket) {
        try {
          let post = new Post();
          post.title = title;
          post.slug = slug;
          post.content = content;
          post.excerpt = excerpt;
          post.featuredImage = imageInfo;
          post.status = status;
          post.publishDate = zonedTimeToUtc(publishDate, "Asia/Manila");

          const result = await post.save();
          res.json(result);
          createEntry(req.profile.name, "Created new post", result, req);
        } catch (err) {
          res.json({
            error: "Failed to save post. Please try again later.",
          });
        }
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

export const read = async (req, res) => {
  const { slug } = req.params;
  try {
    const result = await Post.findOne({ slug }).exec();
    res.json(result);
  } catch (err) {
    res.status(400).json({
      error: "Error occurred while fetching the post.",
      message: err,
    });
  }
};

export const list = async (req, res) => {
  const { skip, limit } = req.query;
  try {
    const result = await Post.find({})
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .exec();
    const count = await Post.countDocuments();
    res.json({ data: result, count });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: "error occured",
      message: err,
    });
  }
};

export const update = async (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    const { title, content, slug, status, publishDate } = fields;
    const { image } = files;

    let post = await Post.findOne({ slug }).exec();

    let imageInfo;
    if (image) {
      deleteObjectFromS3(post.featuredImage.key, post.featuredImage.bucket);

      var date = new Date();
      var month = date.getUTCMonth() + 1; //months from 1-12
      var year = date.getUTCFullYear();


      try {
        imageInfo = await uploadFile(
          image,
          `post/${year}/${month}/${slug}`
        );

        post.featuredImage = imageInfo;
      } catch (err) {
        console.log("Error on upload: ", err);
        return res.status(400).json({ error: "Error on uploading image to Amazon S3" });
      }
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

    try {
      const result = await post.save();
      res.json(result);
      createEntry(req.profile.name, `Updated post ${post.title}`, result, req);
    } catch (err) {
      res.status(400).json({
        error: "Error on updating post. Please try again later.",
        payload: err,
      });
    }
  });
};

export const remove = async (req, res) => {
  const { slug } = req.body;

  if (!slug) {
    return res.status(400).json({
      error: "Post slug is required",
    });
  }

  const data = await Post.deleteOne({ slug }).exec();
  //TODO: DELETE IMAGE

  res.json({ message: "Post deleted successfully" });
  createEntry(req.profile.name, `Deleted post ${slug}`, {}, req);
};


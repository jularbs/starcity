import Post from './post.model.js';
import slugify from 'slugify';
import { smartTrim } from '../../common/utils/smart-trim.js';
import { stripHtml } from 'string-strip-html';
import {
  deleteObjectFromS3,
  uploadFile,
} from '../../common/object-storage/amazon-s3.js';
import { auditTrailService } from '../auditTrail/auditTrail.service.js';
import dateFnsTz from 'date-fns-tz';

const { zonedTimeToUtc } = dateFnsTz;

export const create = async (req, res) => {
  const { title, content, status, publishDate } = req.body;
  const imageFile = req.file;

  if (!title) {
    return res.status(400).json({
      error: 'Title is required',
    });
  }

  const slug = slugify(title).toLowerCase();
  const excerpt = smartTrim(
    stripHtml(content).result.substring(0, 300),
    280,
    ' ',
    '...',
  );

  if (!imageFile) {
    return res.status(400).json({
      error: 'Featured Image is required',
    });
  }

  if (imageFile.size > 1000000) {
    return res.status(400).json({
      error: 'Image too large. ( > 1MB ).',
    });
  }

  const date = new Date();
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();

  try {
    const imageInfo = await uploadFile(
      imageFile,
      `post/${year}/${month}/${slug}`,
    );
    const post = new Post({
      title,
      slug,
      content,
      excerpt,
      featuredImage: imageInfo,
      status,
      publishDate: zonedTimeToUtc(publishDate, 'Asia/Manila'),
    });

    const result = await post.save();
    res.json(result);
    auditTrailService.create({
      action: 'Created new post',
      payload: result,
      request: req,
    });
  } catch (err) {
    console.log('Error creating post: ', err);
    return res.status(400).json({
      error: 'Failed to save post. Please try again later.',
    });
  }
};

export const read = async (req, res) => {
  const { slug } = req.params;
  try {
    const result = await Post.findOne({ slug }).exec();
    res.json(result);
  } catch (err) {
    res.status(400).json({
      error: 'Error occurred while fetching the post.',
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
      error: 'error occured',
      message: err,
    });
  }
};

export const update = async (req, res) => {
  const { title, content, slug, status, publishDate } = req.body;
  const imageFile = req.file;

  let post = await Post.findOne({ slug }).exec();

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  let imageInfo;
  if (imageFile) {
    if (imageFile.size > 1000000) {
      return res.status(400).json({
        error: 'Image too large. ( > 1MB ).',
      });
    }

    if (post.featuredImage?.key && post.featuredImage?.bucket) {
      await deleteObjectFromS3(
        post.featuredImage.key,
        post.featuredImage.bucket,
      );
    }

    const date = new Date();
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();

    try {
      imageInfo = await uploadFile(imageFile, `post/${year}/${month}/${slug}`);
      post.featuredImage = imageInfo;
    } catch (err) {
      console.log('Error on upload: ', err);
      return res
        .status(400)
        .json({ error: 'Error on uploading image to Amazon S3' });
    }
  }

  const excerpt = smartTrim(
    stripHtml(content).result.substring(0, 300),
    280,
    ' ',
    '...',
  );
  post.title = title;
  post.slug = slug;
  post.content = content;
  post.excerpt = excerpt;
  post.status = status;
  post.publishDate = zonedTimeToUtc(publishDate, 'Asia/Manila');

  try {
    const result = await post.save();
    res.json(result);
    auditTrailService.create({
      action: `Updated post ${post.title}`,
      payload: result,
      request: req,
    });
  } catch (err) {
    return res.status(400).json({
      error: 'Error on updating post. Please try again later.',
      payload: err,
    });
  }
};

export const remove = async (req, res) => {
  const { slug } = req.body;

  if (!slug) {
    return res.status(400).json({
      error: 'Post slug is required',
    });
  }

  await Post.deleteOne({ slug }).exec();
  //TODO: DELETE IMAGE

  res.json({ message: 'Post deleted successfully' });
  auditTrailService.create({
    action: `Deleted post ${slug}`,
    payload: {},
    request: req,
  });
};

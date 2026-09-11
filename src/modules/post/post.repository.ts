import Post from './post.model.js';
import { Types } from 'mongoose';

type Media = {
  location: string;
  bucket: string;
  key: string;
};
type CreatePost = {
  authorId: Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: Media;
  status: string;
  publishDate: Date;
};

type ListParams = {
  skip: number;
  limit: number;
};

export const postRepository = {
  create: (data: CreatePost) => Post.create(data),
  findById: (id: Types.ObjectId) => Post.findById(id),
  findBySlug: (slug: string) => Post.findOne({ slug }),
  updateById: (id: Types.ObjectId, data: Partial<CreatePost>) =>
    Post.findByIdAndUpdate(id, data, { new: true }),
  deleteById: (id: Types.ObjectId) => Post.findByIdAndDelete(id),
  list: (params: ListParams) =>
    Post.find().skip(params.skip).limit(params.limit),
  count: () => Post.countDocuments(),
};

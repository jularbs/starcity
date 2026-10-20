import { AppError } from '../../common/errors/app-error.js';
import { uploadFile } from '../../common/object-storage/amazon-s3.js';
import { postRepository } from './post.repository.js';
import { Types } from 'mongoose';
type Media = {
  location: string;
  bucket: string;
  key: string;
};
type CreatePostInput = {
  authorId: Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: Express.Multer.File | null;
  status: string;
  publishDate?: Date;
};

type ListParams = {
  skip?: number;
  limit?: number;
};

export const postService = {
  create: async (data: CreatePostInput) => {
    if (!data.authorId) {
      throw new AppError({
        message: 'You need to be logged in to create a post ',
        statusCode: 400,
        code: 'AUTH_REQUIRED',
      });
    }

    const date = new Date();
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();

    const imageInfo = await uploadFile(
      data.featuredImage,
      `post/${year}/${month}/${data.slug}`,
    );

    if (data.status == 'published' && !data.publishDate) {
      throw new AppError({
        message: 'Publish date is required when status is published',
        statusCode: 400,
        code: 'PUBLISH_DATE_REQUIRED',
      });
    }

    const createData = {
      authorId: data.authorId,
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      featuredImage: imageInfo,
      status: data.status,
      publishDate: data.publishDate,
    };

    return postRepository.create(createData);
  },

  getById: (id: Types.ObjectId) => postRepository.findById(id),
  getBySlug: async (slug: string) => {
    const post = await postRepository.findBySlug(slug);
    if (!post) {
      throw new AppError({
        message: 'Post not found',
        statusCode: 404,
        code: 'POST_NOT_FOUND',
      });
    }
    return post;
  },
  updateById: async (id: Types.ObjectId, data: Partial<CreatePostInput>) => {
    const post = await postRepository.findById(id);
    if (!post) {
      throw new AppError({
        message: 'Post not found',
        statusCode: 404,
        code: 'POST_NOT_FOUND',
      });
    }

    let imageInfo: Media;

    if (data.featuredImage) {
      const date = new Date();
      const month = date.getUTCMonth() + 1;
      const year = date.getUTCFullYear();

      imageInfo = await uploadFile(
        data.featuredImage,
        `post/${year}/${month}/${data.slug}`,
      );
    }

    return postRepository.updateById(id, {
      ...data,
      ...(imageInfo && { featuredImage: imageInfo }),
    });
  },
  deleteById: async (id: Types.ObjectId) => {
    const post = await postRepository.findById(id);
    if (!post) {
      throw new AppError({
        message: 'Post not found',
        statusCode: 404,
        code: 'POST_NOT_FOUND',
      });
    }
    return postRepository.deleteById(id);
  },
  list: (params: ListParams) => {
    const { skip = 0, limit = 10 } = params;
    return postRepository.list({ skip, limit });
  },
  count: () => postRepository.count(),
};

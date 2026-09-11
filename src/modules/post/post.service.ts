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
  publishDate: Date;
};

type ListParams = {
  skip?: number;
  limit?: number;
};
export const postService = {
  create: async (data: CreatePostInput) => {
    if (!data.authorId) {
      throw new Error('Author ID is required to create a post');
    }

    if (!data.featuredImage) {
      throw new Error('Featured image is required to create a post');
    }

    if (data.featuredImage.size > 1000000) {
      throw new Error('Image too large. ( > 1MB ).');
    }

    const date = new Date();
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();

    let imageInfo: Media;

    try {
      imageInfo = await uploadFile(
        data.featuredImage,
        `post/${year}/${month}/${data.slug}`,
      );
    } catch (err) {
      throw new Error('Failed to upload featured image', { cause: err });
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
  getBySlug: (slug: string) => postRepository.findBySlug(slug),
  updateById: async (id: Types.ObjectId, data: Partial<CreatePostInput>) => {
    if (!id) {
      throw new Error('ID is required to update a post');
    }
    const post = await postRepository.findById(id);
    if (!post) {
      throw new Error('Post not found');
    }

    let imageInfo: Media;

    if (data.featuredImage) {
      if (data.featuredImage.size > 1000000) {
        throw new Error('Image too large. ( > 1MB ).');
      }

      const date = new Date();
      const month = date.getUTCMonth() + 1;
      const year = date.getUTCFullYear();

      try {
        imageInfo = await uploadFile(
          data.featuredImage,
          `post/${year}/${month}/${data.slug}`,
        );
      } catch (err) {
        throw new Error('Failed to upload featured image', { cause: err });
      }
    }

    return postRepository.updateById(id, {
      ...data,
      ...(imageInfo && { featuredImage: imageInfo }),
    });
  },
  deleteById: async (id: Types.ObjectId) => {
    if (!id) {
      throw new Error('ID is required to delete a post');
    }
    const post = await postRepository.findById(id);
    if (!post) {
      throw new Error('Post not found');
    }
    return postRepository.deleteById(id);
  },
  list: (params: ListParams) => {
    const { skip = 0, limit = 10 } = params;
    return postRepository.list({ skip, limit });
  },
  count: () => postRepository.count(),
};

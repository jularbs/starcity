import fs from 'fs';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import path from 'path';
import { config } from '../../config/index.js';

const s3 = new S3Client({
  region: config.aws.s3.region,
  credentials: {
    accessKeyId: config.aws.s3.publicKey,
    secretAccessKey: config.aws.s3.secretKey,
  },
});

export const deleteObjectFromS3 = async (key, bucket) => {
  return s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
};

export const getObjectFromS3 = async (key, bucket) => {
  return s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
};

const getObjectLocation = (bucket, key) =>
  `https://${bucket}.s3.${config.aws.s3.region}.amazonaws.com/${encodeURIComponent(
    key,
  ).replace(/%2F/g, '/')}`;

//V2
export const isValidImage = (file) => {
  const fileType = file.type;
  const validImageTypes = [
    'image/gif',
    'image/avif',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/tiff',
  ];

  if (!validImageTypes.includes(fileType)) {
    return false;
  } else {
    return true;
  }
};

const parseBase64Image = (dataUri) => {
  const match = dataUri.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!match) {
    throw new Error('Expected a base64 image data URI');
  }

  const [, type, encodedData] = match;
  const extension = type.split('/')[1].replace('jpeg', 'jpg');

  return {
    buffer: Buffer.from(encodedData, 'base64'),
    name: `upload.${extension}`,
    type,
  };
};

export const uploadFile = async (file, folder, width = 1600) => {
  const normalizedFile =
    typeof file === 'string' ? parseBase64Image(file) : file;
  const sourceBuffer =
    normalizedFile.buffer || fs.readFileSync(normalizedFile.path);
  let body = sourceBuffer;
  let type = normalizedFile.type;
  let key = `${folder}/${nanoid()}${path.extname(normalizedFile.name)}`;

  if (isValidImage(normalizedFile)) {
    const metadata = await sharp(sourceBuffer).metadata();
    const resizeWidth = Math.min(metadata.width || width, width);
    body = await sharp(sourceBuffer)
      .resize({ width: resizeWidth })
      .avif({ quality: 90 })
      .toBuffer();
    type = 'image/avif';
    key = `${folder}/${nanoid()}.avif`;
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: config.aws.s3.bucketName,
      Key: key,
      Body: body,
      ContentType: type,
    }),
  );

  return {
    location: getObjectLocation(config.aws.s3.bucketName, key),
    bucket: config.aws.s3.bucketName,
    key,
    type,
  };
};

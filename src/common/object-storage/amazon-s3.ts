//TODOS: Test uploadFile with different image types and base64 strings
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import path from 'path';
import { config } from '../../config/index.js';

type Base64ImageFile = { buffer: Buffer; name: string; type: string };
type UploadFile = Express.Multer.File;
type NormalizedUploadFile = {
  buffer: Buffer;
  name: string;
  type: string;
};

const s3 = new S3Client({
  region: config.aws.s3.region,
  endpoint: config.aws.s3.endpoint,
  forcePathStyle: Boolean(config.aws.s3.endpoint),
  credentials: {
    accessKeyId: config.aws.s3.publicKey,
    secretAccessKey: config.aws.s3.secretKey,
  },
});

export async function verifyS3Connection() {
  const command = new HeadBucketCommand({ Bucket: config.aws.s3.bucketName });
  try {
    await s3.send(command);
    console.log('S3 bucket connection verified successfully.');
  } catch (error) {
    console.error('Failed to connect to S3 bucket:', error.message);
    process.exit(1);
  }
}

export const deleteObjectFromS3 = async (key: string, bucket: string) => {
  return s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
};

export const getObjectFromS3 = async (key: string, bucket: string) => {
  return s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
};

const getObjectLocation = (bucket: string, key: string): string =>
  `https://${bucket}.s3.${config.aws.s3.region}.amazonaws.com/${encodeURIComponent(
    key,
  ).replace(/%2F/g, '/')}`;

const isValidImage = (file: NormalizedUploadFile) => {
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

const parseBase64Image = (dataUri: string): Base64ImageFile => {
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

export const uploadFile = async (
  file: string | UploadFile | Base64ImageFile,
  folder: string,
  width = 1600,
) => {
  let normalizedFile: NormalizedUploadFile;

  if (typeof file === 'string') {
    normalizedFile = parseBase64Image(file);
  } else if ('originalname' in file) {
    normalizedFile = {
      buffer: file.buffer,
      name: file.originalname,
      type: file.mimetype,
    };
  } else {
    normalizedFile = file;
  }
  const sourceBuffer = normalizedFile.buffer;

  let body = sourceBuffer;
  let type = normalizedFile.type;
  let key = `${folder}/${nanoid()}${path.extname(normalizedFile.name)}`;

  if (isValidImage(normalizedFile)) {
    const metadata = await sharp(sourceBuffer).metadata();
    const resizeWidth = Math.min(metadata.width || width, width);
    body = await sharp(sourceBuffer)
      .resize({ width: resizeWidth })
      .avif({ quality: 80 })
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

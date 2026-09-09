//TODOS: Test uploadFile with different image types and base64 strings
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
import { File } from 'formidable';

type Base64ImageFile = { buffer: Buffer; name: string; type: string };
type MulterFile = Express.Multer.File;
type UploadFile = File | MulterFile;
type NormalizedUploadFile = {
  buffer?: Buffer;
  path?: string;
  name: string;
  type: string;
};
type LegacyUploadFile = File & {
  filepath?: string;
  originalFilename?: string | null;
  mimetype?: string | null;
  path?: string;
  name?: string;
  type?: string;
  newFilename?: string;
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
  } else if ('buffer' in file) {
    normalizedFile = file;
  } else {
    const legacyFile = file as LegacyUploadFile;
    normalizedFile = {
      path: legacyFile.filepath ?? legacyFile.path,
      name:
        legacyFile.originalFilename ??
        legacyFile.name ??
        legacyFile.newFilename ??
        'upload',
      type:
        legacyFile.mimetype ?? legacyFile.type ?? 'application/octet-stream',
    };
  }
  const sourceBuffer =
    normalizedFile.buffer ??
    (normalizedFile.path ? fs.readFileSync(normalizedFile.path) : undefined);

  if (!sourceBuffer) {
    throw new Error('Upload file does not contain a buffer or file path');
  }

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

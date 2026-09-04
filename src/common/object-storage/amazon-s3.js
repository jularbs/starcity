import fs from 'fs';
import AWS from 'aws-sdk';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import path from 'path';
import { config } from '../../config/index.js';

const s3 = new AWS.S3({
  accessKeyId: config.aws.s3.publicKey,
  secretAccessKey: config.aws.s3.secretKey,
});

export const deleteObjectFromS3 = async (key, bucket) => {
  const params = {
    Bucket: bucket,
    Key: key,
  };

  const res = await new Promise((resolve, reject) => {
    s3.deleteObject(params, (err, data) =>
      err == null ? resolve(data) : reject(err),
    );
  });

  return res;
};

export const getObjectFromS3 = async (key, bucket) => {
  const params = {
    Bucket: bucket,
    Key: key,
  };

  const res = await new Promise((resolve, reject) => {
    s3.getObject(params, function (err, data) {
      err == null ? resolve(data) : reject(err);
    });
  });

  return res;
};

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

  const data = await s3
    .upload({
      Bucket: config.aws.s3.bucketName,
      Key: key,
      Body: body,
      ContentType: type,
    })
    .promise();

  return {
    location: data.Location,
    bucket: data.Bucket,
    key: data.Key,
    type,
  };
};

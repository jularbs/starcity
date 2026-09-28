import QRCode from 'qrcode';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const send = vi.fn();
const metadata = vi.fn();
const resize = vi.fn();
const avif = vi.fn();
const toBuffer = vi.fn();

vi.mock('../../config/index.js', () => ({
  config: {
    aws: {
      s3: {
        region: 'ap-southeast-1',
        publicKey: 'test-key',
        secretKey: 'test-secret',
        bucketName: 'test-bucket',
      },
    },
  },
}));

vi.mock('nanoid', () => ({ nanoid: () => 'test-file-id' }));

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: class {
    send = send;
  },
  DeleteObjectCommand: class {
    constructor(public input: unknown) {}
  },
  GetObjectCommand: class {
    constructor(public input: unknown) {}
  },
  PutObjectCommand: class {
    constructor(public input: unknown) {}
  },
}));

const sharp = vi.fn(() => ({
  metadata,
  resize,
}));

vi.mock('sharp', () => ({
  default: sharp,
}));

describe('Amazon S3 Unit Tests', () => {
  beforeEach(() => {
    send.mockReset().mockResolvedValue({});
    metadata.mockReset().mockResolvedValue({ width: 300 });
    resize.mockReset().mockReturnValue({ avif });
    avif.mockReset().mockReturnValue({ toBuffer });
    toBuffer.mockReset().mockResolvedValue(Buffer.from('converted-image'));
  });

  it('forwards get and delete requests to S3', async () => {
    const { deleteObjectFromS3, getObjectFromS3 } =
      await import('./amazon-s3.js');

    await getObjectFromS3('images/source.png', 'source-bucket');
    await deleteObjectFromS3('images/source.png', 'source-bucket');

    expect(send).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        input: { Bucket: 'source-bucket', Key: 'images/source.png' },
      }),
    );
    expect(send).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        input: { Bucket: 'source-bucket', Key: 'images/source.png' },
      }),
    );
  });

  it('accepts a generated QR code data URI and uploads it as AVIF', async () => {
    const { uploadFile } = await import('./amazon-s3.js');
    const qrCode = await QRCode.toDataURL('W-RAYC-TEST1234');

    const result = await uploadFile(qrCode, 'access-pass/2026/9/test', 300);

    expect(sharp).toHaveBeenCalledWith(expect.any(Buffer));
    expect(metadata).toHaveBeenCalledOnce();
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          Bucket: 'test-bucket',
          Key: 'access-pass/2026/9/test/test-file-id.avif',
          Body: Buffer.from('converted-image'),
          ContentType: 'image/avif',
        }),
      }),
    );
    expect(result).toEqual({
      location:
        'https://test-bucket.s3.ap-southeast-1.amazonaws.com/access-pass/2026/9/test/test-file-id.avif',
      bucket: 'test-bucket',
      key: 'access-pass/2026/9/test/test-file-id.avif',
      type: 'image/avif',
    });
  });

  it('resizes a JPEG to the requested width and uploads it as AVIF', async () => {
    const { uploadFile } = await import('./amazon-s3.js');
    const jpegBuffer = Buffer.from('jpeg-image-content');
    const image = {
      buffer: jpegBuffer,
      name: 'hero.jpg',
      type: 'image/jpeg',
    };
    metadata.mockResolvedValue({ width: 2400 });

    const result = await uploadFile(image as never, 'images', 500);

    expect(sharp).toHaveBeenCalledWith(jpegBuffer);
    expect(metadata).toHaveBeenCalledOnce();
    expect(resize).toHaveBeenCalledWith({ width: 500 });
    expect(avif).toHaveBeenCalledWith({ quality: 80 });
    expect(toBuffer).toHaveBeenCalledOnce();
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Bucket: 'test-bucket',
          Key: 'images/test-file-id.avif',
          Body: Buffer.from('converted-image'),
          ContentType: 'image/avif',
        },
      }),
    );
    expect(result.type).toBe('image/avif');
  });

  it('uploads non-image files without image processing', async () => {
    const { uploadFile } = await import('./amazon-s3.js');
    const fileBuffer = Buffer.from('test PDF content');
    const document = {
      buffer: fileBuffer,
      name: 'terms.pdf',
      type: 'application/pdf',
    };

    const result = await uploadFile(document as never, 'documents');

    expect(metadata).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Bucket: 'test-bucket',
          Key: 'documents/test-file-id.pdf',
          Body: fileBuffer,
          ContentType: 'application/pdf',
        },
      }),
    );
    expect(result).toEqual({
      location:
        'https://test-bucket.s3.ap-southeast-1.amazonaws.com/documents/test-file-id.pdf',
      bucket: 'test-bucket',
      key: 'documents/test-file-id.pdf',
      type: 'application/pdf',
    });
  });

  it('rejects invalid base64 data before making an S3 request', async () => {
    const { uploadFile } = await import('./amazon-s3.js');

    await expect(uploadFile('not-a-data-uri', 'uploads')).rejects.toThrow(
      'Expected a base64 image data URI',
    );
    expect(send).not.toHaveBeenCalled();
  });
});

import crypto from 'crypto';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import { AppError } from '../../common/errors/app-error.js';
import { config } from '../../config/index.js';

const getEncryptionKey = () => {
  if (config.auth.mfaEncryptionKey) {
    return Buffer.from(config.auth.mfaEncryptionKey, 'base64');
  }

  return crypto
    .createHash('sha256')
    .update(`${config.auth.jwtSecret}:mfa-encryption:development`)
    .digest();
};

export const encryptMfaSecret = (secret: string) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(secret, 'utf8'),
    cipher.final(),
  ]);

  return [iv, cipher.getAuthTag(), ciphertext]
    .map((part) => part.toString('base64url'))
    .join('.');
};

export const decryptMfaSecret = (encryptedSecret: string) => {
  const [iv, authTag, ciphertext] = encryptedSecret
    .split('.')
    .map((part) => Buffer.from(part, 'base64url'));
  if (!iv || !authTag || !ciphertext) {
    throw new AppError({
      message: 'Unable to decrypt MFA secret',
      code: 'MFA_SECRET_INVALID',
      statusCode: 500,
    });
  }

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    iv,
  );
  decipher.setAuthTag(authTag);
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8');
};

export const createTotp = (email: string, base32Secret: string) =>
  new OTPAuth.TOTP({
    issuer: config.app.name,
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(base32Secret),
  });

export const createTotpQrCode = async (otpauthUrl: string) =>
  QRCode.toDataURL(otpauthUrl);

export const verifyTotp = (
  email: string,
  base32Secret: string,
  token: string,
) => {
  const totp = createTotp(email, base32Secret);
  const delta = totp.validate({ token, window: 1 });
  if (delta === null) return null;

  return Math.floor(Date.now() / 1000 / totp.period) + delta;
};

export const createRecoveryCodes = () =>
  Array.from({ length: 10 }, () => crypto.randomBytes(8).toString('hex'));

export const hashRecoveryCode = (code: string) =>
  crypto
    .createHash('sha256')
    .update(code.replace(/[-\s]/g, '').toLowerCase())
    .digest('hex');

export const hashMfaChallenge = (challenge: string) =>
  crypto.createHash('sha256').update(challenge).digest('hex');

export const createMfaChallenge = () => crypto.randomBytes(32).toString('hex');

import * as OTPAuth from 'otpauth';
import {
  createTotp,
  decryptMfaSecret,
  encryptMfaSecret,
  hashRecoveryCode,
  verifyTotp,
} from './mfa.helpers.js';

describe('MFA helpers', () => {
  it('encrypts TOTP secrets and decrypts them for verification', () => {
    const secret = new OTPAuth.Secret({ size: 20 }).base32;

    expect(decryptMfaSecret(encryptMfaSecret(secret))).toBe(secret);
  });

  it('verifies generated TOTP codes and rejects incorrect codes', () => {
    const email = 'admin@example.com';
    const secret = new OTPAuth.Secret({ size: 20 }).base32;
    const code = createTotp(email, secret).generate();
    const wrongCode = `${(Number(code[0]) + 1) % 10}${code.slice(1)}`;

    expect(verifyTotp(email, secret, code)).not.toBeNull();
    expect(verifyTotp(email, secret, wrongCode)).toBeNull();
  });

  it('hashes recovery codes consistently despite separators and case', () => {
    expect(hashRecoveryCode('ABCD-1234')).toBe(hashRecoveryCode('abcd 1234'));
    expect(hashRecoveryCode('ABCD-1234')).not.toBe('ABCD-1234');
  });
});

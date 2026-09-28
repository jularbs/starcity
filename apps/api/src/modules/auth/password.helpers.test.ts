import {
  encryptPassword,
  authenticate,
  generateSalt,
} from './password.helpers.js';

describe('Password Helpers', () => {
  it('hashes a password into a different string', async () => {
    const plainPassword = 'mysecretpassword';
    const salt = generateSalt();
    const hashedPassword = encryptPassword({ password: plainPassword, salt });

    expect(hashedPassword).toEqual(expect.any(String));
    expect(hashedPassword).not.toBe(plainPassword);
  });

  it('verifies a correct password', async () => {
    const plainPassword = 'mysecretpassword';
    const salt = generateSalt();
    const hashedPassword = encryptPassword({ password: plainPassword, salt });

    const isValid = authenticate({
      password: plainPassword,
      salt,
      hashedPassword,
    });
    expect(isValid).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const plainPassword = 'mysecretpassword';
    const wrongPassword = 'wrongpassword';
    const salt = generateSalt();
    const hashedPassword = encryptPassword({ password: plainPassword, salt });

    const isValid = authenticate({
      password: wrongPassword,
      salt,
      hashedPassword,
    });
    expect(isValid).toBe(false);
  });
});

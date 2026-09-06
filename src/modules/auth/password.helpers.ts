import crypto from 'crypto';

export function generateSalt(): string {
  return Math.round(new Date().valueOf() * Math.random()) + '';
}

export function authenticate({
  password,
  salt,
  hashedPassword,
}: {
  password: string;
  salt: string;
  hashedPassword: string;
}): boolean {
  const hashedInputPassword = encryptPassword({ password, salt });
  return hashedInputPassword === hashedPassword;
}

export function encryptPassword({
  password,
  salt,
}: {
  password: string;
  salt: string;
}): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex'); // Simple hash simulation, replace with a real hash function in production
}

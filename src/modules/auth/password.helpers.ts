import crypto from 'crypto';
import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import { matcherPwnedFactory } from '@zxcvbn-ts/matcher-pwned';

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

export async function passwordStrengthValidation(
  password: string,
  userContext: string[],
): Promise<{
  score: number;
  feedback: {
    warning: string;
    suggestions: string[];
  };
}> {
  const loadOptions = async () => {
    const zxcvbnCommonPackage = await import('@zxcvbn-ts/language-common');
    const zxcvbnEnPackage = await import('@zxcvbn-ts/language-en');

    return {
      translations: zxcvbnEnPackage.translations,
      graphs: zxcvbnCommonPackage.adjacencyGraphs,
      dictionary: {
        ...zxcvbnCommonPackage.dictionary,
        ...zxcvbnEnPackage.dictionary,
        userInputs: [
          'starcity',
          'star city',
          'snow world',
          'snowworld',
          'ride all you can',
        ],
      },
      useLevenshtein: true,
    };
  };

  const customMatcher = {
    pwned: matcherPwnedFactory(fetch),
  };

  const options = await loadOptions();
  const zxcvbn = new ZxcvbnFactory(options, customMatcher);

  const result = await zxcvbn.checkAsync(password, userContext);

  return {
    score: result.score,
    feedback: {
      warning: result.feedback.warning,
      suggestions: result.feedback.suggestions,
    },
  };
}

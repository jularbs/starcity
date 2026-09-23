import RevokedAccessToken from './revokedAccessToken.model.js';

const revoke = async (jti: string, expiresAt: Date) => {
  await RevokedAccessToken.updateOne(
    { jti },
    { $setOnInsert: { jti, expiresAt } },
    { upsert: true },
  );
};

const isRevoked = async (jti: string) => {
  return Boolean(
    await RevokedAccessToken.exists({
      jti,
      expiresAt: { $gt: new Date() },
    }),
  );
};

export const revokedAccessTokenRepository = {
  revoke,
  isRevoked,
};

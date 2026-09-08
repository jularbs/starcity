import { env } from './env.js';

export const config = {
  app: {
    name: env.APP_NAME,
    env: env.NODE_ENV,
    port: env.PORT,
    apiUrl: env.DOMAIN,
    websiteUrl: env.WEBSITE_URL,
    dataRetentionDays: env.DATA_RETENTION_DAYS,
    reportsRecipient: env.REPORTS_RECIPIENT,
    isDevelopment: env.NODE_ENV === 'development',
    isTest: env.NODE_ENV === 'test',
    isProduction: env.NODE_ENV === 'production',
    isTurnstileSyncEnabled: env.TURNSTILE_SYNC_ENABLED,
  },
  cors: {
    origin: env.CORS_DOMAINS,
  },
  database: {
    mongodb: {
      url: env.DB_CONNECTION_STRING,
    },
    turnstile: {
      host: env.MYSQL_HOST,
      user: env.MYSQL_USER,
      password: env.MYSQL_PASSWORD,
      db: env.MYSQL_DB,
      port: env.MYSQL_PORT,
    },
  },
  email: {
    protocol: env.EMAIL_PROTOCOL,
    host: env.EMAIL_HOST,
    encryption: env.EMAIL_ENCRYPTION,
    address: env.EMAIL_ADDRESS,
    port: env.EMAIL_PORT,
    password: env.EMAIL_PASSWORD,
    secure: env.EMAIL_SECURE,
  },
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiresInMinutes: env.JWT_ACCESS_EXPIRES_IN_MINUTES,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresInDays: env.JWT_REFRESH_EXPIRES_IN_DAYS,
    cookieSecure: env.JWT_COOKIE_SECURE,
  },
  aws: {
    s3: {
      publicKey: env.AWS_S3_PUBLICKEY,
      secretKey: env.AWS_S3_SECRETKEY,
      region: env.AWS_S3_REGION,
      bucketName: env.AWS_S3_BUCKETNAME,
    },
  },
  sm: {
    token: env.SM_TOKEN,
  },
  paymaya: {
    publicKey: env.PAYMAYA_PUBLIC_KEY,
    environment: env.PAYMAYA_ENVIRONMENT,
    allowedIps: env.PAYMAYA_ALLOWED_IPS,
  },
} as const;

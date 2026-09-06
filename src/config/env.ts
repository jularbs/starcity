import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  APP_NAME: z.string().default('API NAME'),
  PORT: z.coerce.number(),
  CORS_DOMAINS: z
    .string()
    .default('["http://localhost:3000","http://localhost:3001"]')
    .transform((value, context) => {
      try {
        return JSON.parse(value);
      } catch {
        context.addIssue({
          code: 'invalid_type',
          message: 'CORS_DOMAINS must be a JSON array of URLs',
          expected: 'JSON array of URLs',
        });
        return z.NEVER;
      }
    })
    .pipe(z.array(z.url())),
  DB_CONNECTION_STRING: z.string(),
  MYSQL_HOST: z.string(),
  MYSQL_USER: z.string(),
  MYSQL_PASSWORD: z.string(),
  MYSQL_DB: z.string(),
  MYSQL_PORT: z.coerce.number().default(3306),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRES_IN_DAYS: z.coerce.number().default(7),
  JWT_COOKIE_SECURE: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default(true),
  DOMAIN: z.url(),
  WEBSITE_URL: z.url(),
  AWS_S3_PUBLICKEY: z.string(),
  AWS_S3_SECRETKEY: z.string(),
  AWS_S3_REGION: z.string(),
  AWS_S3_BUCKETNAME: z.string(),
  EMAIL_PROTOCOL: z.string().default('smtp'),
  EMAIL_HOST: z.string(),
  EMAIL_ENCRYPTION: z.string().default('tls'),
  EMAIL_ADDRESS: z.string(),
  EMAIL_PORT: z.coerce.number().default(587),
  EMAIL_PASSWORD: z.string(),
  EMAIL_SECURE: z.enum(['true', 'false']).transform((val) => val === 'true'),
  DATA_RETENTION_DAYS: z.coerce.number().default(500),
  SM_TOKEN: z.string(),
  REPORTS_RECIPIENT: z.string(),
  PAYMAYA_PUBLIC_KEY: z.string(),
  PAYMAYA_ENVIRONMENT: z.string(),
  PAYMAYA_ALLOWED_IPS: z.string().default('13.229.160.234,3.1.199.75'),
});

// Validate process.env against the schema
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formattedErrors = parsed.error.flatten();
  console.error(
    '❌ Invalid environment variables:',
    formattedErrors.fieldErrors,
  );
  process.exit(1);
}

// Export the typesafe configuration object
export const env = parsed.data;

import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env.js';

export const spacesClient = new S3Client({
  region: env.SPACES_REGION,
  endpoint: env.SPACES_ENDPOINT,
  forcePathStyle: false,
  credentials: {
    accessKeyId: env.SPACES_ACCESS_KEY,
    secretAccessKey: env.SPACES_SECRET_KEY
  }
});

import { S3Client } from '@aws-sdk/client-s3';

export function createR2S3Client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: process.env.R2_S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

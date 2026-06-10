import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';

export const DEFAULT_PRESIGN_EXPIRES_SEC = 300;

interface CreatePresignedPutInput {
  key: string;
  contentType: string;
  expiresInSec?: number;
}

@Injectable()
export class R2Service {
  constructor(private readonly s3Client: S3Client) {}

  async createPresignedPut(input: CreatePresignedPutInput): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: input.key,
      ContentType: input.contentType,
    });
    const expiresIn = input.expiresInSec ?? DEFAULT_PRESIGN_EXPIRES_SEC;

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  buildPublicUrl(key: string): string {
    const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL.replace(/\/$/, '');

    return `${publicBaseUrl}/${key}`;
  }
}

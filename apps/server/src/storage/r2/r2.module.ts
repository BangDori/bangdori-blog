import { S3Client } from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';
import { createR2S3Client } from '@/storage/r2/r2.client';
import { R2Service } from '@/storage/r2/r2.service';

@Module({
  providers: [
    {
      provide: S3Client,
      useFactory: () => createR2S3Client(),
    },
    R2Service,
  ],
  exports: [R2Service],
})
export class R2Module {}

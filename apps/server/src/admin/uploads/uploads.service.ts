import { Injectable, Logger } from '@nestjs/common';
import { PresignUploadDto } from '@admin/uploads/dto/presign-upload.dto';
import { buildUploadObjectKey } from '@admin/uploads/uploads-policy';
import { DEFAULT_PRESIGN_EXPIRES_SEC, R2Service } from '@/storage/r2/r2.service';

export interface PresignUploadResult {
  key: string;
  uploadUrl: string;
  publicUrl: string;
  expiresInSec: number;
}

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(private readonly r2Service: R2Service) {}

  async presign(dto: PresignUploadDto): Promise<PresignUploadResult> {
    const key = buildUploadObjectKey({
      originalFilename: dto.originalFilename,
      contentType: dto.contentType,
      prefix: 'posts',
    });
    const expiresInSec = DEFAULT_PRESIGN_EXPIRES_SEC;

    const uploadUrl = await this.r2Service.createPresignedPut({
      key,
      contentType: dto.contentType,
      expiresInSec,
    });
    const publicUrl = this.r2Service.buildPublicUrl(key);

    this.logger.log({
      msg: 'R2 presigned PUT 발급',
      key,
      contentType: dto.contentType,
      expiresInSec,
    });

    return { key, uploadUrl, publicUrl, expiresInSec };
  }
}

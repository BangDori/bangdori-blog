import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAccessGuard } from '@admin/auth/jwt-access.guard';
import { PresignUploadDto } from '@admin/uploads/dto/presign-upload.dto';
import { UploadsService } from '@admin/uploads/uploads.service';

@UseGuards(JwtAccessGuard)
@Controller('admin/uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presign')
  presign(@Body() dto: PresignUploadDto) {
    return this.uploadsService.presign(dto);
  }
}

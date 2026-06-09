import { Module } from '@nestjs/common';
import { UploadsController } from '@admin/uploads/uploads.controller';
import { UploadsService } from '@admin/uploads/uploads.service';
import { R2Module } from '@/storage/r2/r2.module';

@Module({
  imports: [R2Module],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class AdminUploadsModule {}

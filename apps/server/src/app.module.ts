import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health.controller';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule],
  controllers: [HealthController],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminPostsModule } from '@admin/posts/posts.module';
import { DatabaseModule } from '@database/database.module';
import { HealthController } from '@/health.controller';
import { LoggerModule } from '@/logger/logger.module';

const env = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${env}`, '.env'],
    }),
    DatabaseModule,
    LoggerModule,
    AdminPostsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@admin/auth/auth.module';
import { ExternalPostsModule } from '@admin/external-posts/external-posts.module';
import { AdminPostsModule } from '@admin/posts/posts.module';
import { AdminUploadsModule } from '@admin/uploads/uploads.module';
import { UsersModule } from '@admin/users/users.module';
import { DatabaseModule } from '@database/database.module';
import { HealthController } from '@/health.controller';
import { LoggerModule } from '@/logger/logger.module';
import { UserPostsModule } from '@/user/posts/user-posts.module';

const env = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${env}`, '.env'],
      isGlobal: true,
    }),
    DatabaseModule,
    LoggerModule,
    UsersModule,
    AuthModule,
    AdminPostsModule,
    AdminUploadsModule,
    ExternalPostsModule,
    UserPostsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

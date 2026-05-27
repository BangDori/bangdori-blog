import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from '@admin/auth/auth.controller';
import { AuthService } from '@admin/auth/auth.service';
import { parseExpiresSeconds } from '@admin/auth/expires';
import { JwtAccessStrategy } from '@admin/auth/jwt-access.strategy';
import { UsersModule } from '@admin/users/users.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: parseExpiresSeconds(config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '1d'),
        },
      }),
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAccessStrategy],
  exports: [AuthService, JwtAccessStrategy],
})
export class AuthModule {}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthError } from '@admin/auth/auth.error';
import { parseExpiresMs } from '@admin/auth/expires';
import type { JwtAccessPayload } from '@admin/auth/jwt-access.strategy';
import { UsersService } from '@admin/users/users.service';
import type { User } from '@database/entities/user.entity';

export interface IssuedAccessToken {
  token: string;
  expiresAt: Date;
}

export interface LoginResult {
  user: User;
  access: IssuedAccessToken;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException(AuthError.invalidCredentials);
    }

    const ok = await this.users.verifyPassword(user, password);
    if (!ok) {
      throw new UnauthorizedException(AuthError.invalidCredentials);
    }

    const access = this.issueAccessToken(user);

    return { user, access };
  }

  private issueAccessToken(user: User): IssuedAccessToken {
    // JwtModule.registerAsync 에서 expiresIn 기본값을 이미 설정했으므로
    // sign 시점에서는 추가 options 없이 payload 만 전달한다.
    const ttl = this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '1d';
    const payload: JwtAccessPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const token = this.jwt.sign(payload);
    const expiresAt = new Date(Date.now() + parseExpiresMs(ttl));

    return { token, expiresAt };
  }
}

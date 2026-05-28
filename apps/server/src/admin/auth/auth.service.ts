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

    // 타이밍 공격 방어 — docs/admin-auth-security.md "사용자 enumeration 방어선" 참조
    const ok = user
      ? await this.users.verifyPassword(user, password)
      : await this.users.verifyDummyPassword(password);

    if (!user || !ok) {
      throw new UnauthorizedException(AuthError.invalidCredentials);
    }

    const access = this.issueAccessToken(user);

    return { user, access };
  }

  private issueAccessToken(user: User): IssuedAccessToken {
    // expiresIn 은 JwtModule.registerAsync 에서 설정 — sign 시점에는 payload 만 전달한다.
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

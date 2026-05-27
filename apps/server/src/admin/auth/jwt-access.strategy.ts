import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { AuthError } from '@admin/auth/auth.error';
import { ACCESS_COOKIE_NAME } from '@admin/auth/cookies';

export interface JwtAccessPayload {
  sub: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequestUser {
  id: string;
  email: string;
  role: string;
}

export const JWT_ACCESS_STRATEGY = 'jwt-access';

function extractFromAccessCookie(req: Request): string | null {
  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
  return cookies?.[ACCESS_COOKIE_NAME] ?? null;
}

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, JWT_ACCESS_STRATEGY) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: extractFromAccessCookie,
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: JwtAccessPayload): AuthenticatedRequestUser {
    if (!payload?.sub || payload.role !== 'admin') {
      throw new UnauthorizedException(AuthError.unauthorized);
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}

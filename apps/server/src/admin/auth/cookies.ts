import type { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

export const ACCESS_COOKIE_NAME = 'atk';
export const ACCESS_COOKIE_PATH = '/';

function baseOptions(config: ConfigService) {
  const secure = config.get<string>('COOKIE_SECURE') === 'true';
  const rawDomain = config.get<string>('COOKIE_DOMAIN');
  const domain = rawDomain && rawDomain.length > 0 ? rawDomain : undefined;

  return {
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
    path: ACCESS_COOKIE_PATH,
    domain,
  };
}

export function setAccessCookie(
  res: Response,
  token: string,
  options: { config: ConfigService; maxAgeMs: number },
): void {
  res.cookie(ACCESS_COOKIE_NAME, token, {
    ...baseOptions(options.config),
    maxAge: options.maxAgeMs,
  });
}

export function clearAccessCookie(res: Response, config: ConfigService): void {
  res.clearCookie(ACCESS_COOKIE_NAME, baseOptions(config));
}

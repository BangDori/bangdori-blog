import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthError } from '@admin/auth/auth.error';
import { AuthService } from '@admin/auth/auth.service';
import { clearAccessCookie, setAccessCookie } from '@admin/auth/cookies';
import { LoginDto } from '@admin/auth/dto/login.dto';
import { parseExpiresMs } from '@admin/auth/expires';
import { JwtAccessGuard } from '@admin/auth/jwt-access.guard';
import type { AuthenticatedRequestUser } from '@admin/auth/jwt-access.strategy';

interface RequestWithUser extends Request {
  user?: AuthenticatedRequestUser;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  private accessCookieMaxAgeMs(): number {
    return parseExpiresMs(this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '1d');
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, access } = await this.authService.login(dto.email, dto.password);

    setAccessCookie(res, access.token, {
      config: this.config,
      maxAgeMs: this.accessCookieMaxAgeMs(),
    });

    return {
      accessTokenExpiresAt: access.expiresAt.toISOString(),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response) {
    clearAccessCookie(res, this.config);
  }

  @Get('me')
  @UseGuards(JwtAccessGuard)
  me(@Req() req: RequestWithUser) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException(AuthError.unauthorized);
    }
    return { id: user.id, email: user.email, role: user.role };
  }
}

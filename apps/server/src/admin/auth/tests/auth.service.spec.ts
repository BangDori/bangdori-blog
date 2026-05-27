import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AuthError } from '@admin/auth/auth.error';
import { AuthService } from '@admin/auth/auth.service';
import { UsersService } from '@admin/users/users.service';
import type { User } from '@database/entities/user.entity';

type UsersMock = jest.Mocked<Pick<UsersService, 'findByEmail' | 'verifyPassword'>>;
type JwtMock = { sign: jest.Mock };

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u-1',
    email: 'admin@bangdori.local',
    passwordHash: 'hash',
    role: 'admin',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let users: UsersMock;
  let jwt: JwtMock;

  beforeEach(async () => {
    users = {
      findByEmail: jest.fn(),
      verifyPassword: jest.fn(),
    };
    jwt = { sign: jest.fn().mockReturnValue('jwt-token') };

    const config = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_ACCESS_EXPIRES_IN') return '1d';
        return undefined;
      }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('login', () => {
    it('이메일이 존재하지 않으면 인증 실패 메시지를 보낸다', async () => {
      // given: 해당 이메일의 사용자가 없는 상태
      users.findByEmail.mockResolvedValue(null);

      // when & then: 정해진 인증 실패 응답이 발생한다
      await expect(service.login('nope@x', 'pw')).rejects.toThrow(
        new UnauthorizedException(AuthError.invalidCredentials),
      );
    });

    it('이메일이 존재하지 않으면 비밀번호 검증과 토큰 발급을 시도하지 않는다', async () => {
      // given: 해당 이메일의 사용자가 없는 상태
      users.findByEmail.mockResolvedValue(null);

      // when
      await service.login('nope@x', 'pw').catch(() => {});

      // then: 후속 단계가 호출되지 않는다
      expect(users.verifyPassword).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('비밀번호가 일치하지 않으면 이메일이 없을 때와 같은 인증 실패 메시지를 보낸다', async () => {
      // given: 사용자는 있지만 비밀번호 검증이 실패하는 상태
      users.findByEmail.mockResolvedValue(makeUser());
      users.verifyPassword.mockResolvedValue(false);

      // when & then: 이메일 미존재 케이스와 같은 응답
      await expect(service.login('admin@bangdori.local', 'wrong')).rejects.toThrow(
        new UnauthorizedException(AuthError.invalidCredentials),
      );
    });

    it('비밀번호가 일치하지 않으면 토큰을 발급하지 않는다', async () => {
      // given: 사용자는 있지만 비밀번호 검증이 실패하는 상태
      users.findByEmail.mockResolvedValue(makeUser());
      users.verifyPassword.mockResolvedValue(false);

      // when
      await service.login('admin@bangdori.local', 'wrong').catch(() => {});

      // then: 토큰 발급이 시도되지 않는다
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('로그인에 성공하면 사용자와 만료 시각이 설정된 인증 토큰을 함께 반환한다', async () => {
      // given: 인증을 통과하는 사용자, 설정 상 만료는 '1d'
      const user = makeUser();
      users.findByEmail.mockResolvedValue(user);
      users.verifyPassword.mockResolvedValue(true);
      const before = Date.now();

      // when
      const result = await service.login(user.email, 'pw');

      // then: 토큰 payload 에 사용자 식별 정보 + 결과에 사용자/토큰/24시간 만료
      expect(jwt.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
      expect(result.user).toBe(user);
      expect(result.access.token).toBe('jwt-token');
      const oneDayMs = 24 * 60 * 60 * 1000;
      expect(result.access.expiresAt.getTime()).toBeGreaterThanOrEqual(before + oneDayMs);
      expect(result.access.expiresAt.getTime()).toBeLessThanOrEqual(Date.now() + oneDayMs + 1000);
    });
  });
});

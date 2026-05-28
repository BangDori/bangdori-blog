import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { User } from '@database/entities/user.entity';

/**
 * 타이밍 공격 방어용 dummy hash.
 *
 * 사용자가 존재하지 않아도 verifyDummyPassword 가 verifyPassword 와 같은 argon2
 * 비용을 소모하도록 module 로딩 시 random 비밀번호를 한 번 hash 해 두고
 * 같은 process 안에서는 재사용한다.
 */
const dummyHashPromise = argon2.hash(randomBytes(32).toString('hex'));

/**
 * admin/CMS 사용자 조회 + 비밀번호 검증 책임만 가진다.
 *
 * 계정 생성(seed)은 서버 코드에서 자동으로 하지 않는다.
 * 운영자가 `scripts/hash-password.ts` 로 argon2 hash 를 생성한 뒤 DB 에 직접 INSERT 한다.
 * 이렇게 하면 평문 admin 비밀번호가 서버 env / 프로세스 메모리에 영구 보관되지 않는다.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  verifyPassword(user: User, plain: string): Promise<boolean> {
    // argon2.verify 반환값 의미:
    // - resolve(true)  → 일치 (인증 성공)
    // - resolve(false) → 불일치 (비밀번호 틀림 — 사용자 에러)
    // - reject(Error)  → hash 자체 손상/형식 불일치 (시스템 에러 — 운영자 즉시 인지 필요)
    //
    // 시스템 에러를 false 로 숨기면 401 로 위장되어 데이터 손상 감지가 늦어지므로
    // 예외는 그대로 전파하여 NestJS 기본 filter 가 500 으로 응답하고 stack 을 로그한다.
    return argon2.verify(user.passwordHash, plain);
  }

  /**
   * 사용자가 없을 때 호출되는 더미 검증. 항상 false 를 반환하되 argon2.verify 비용을
   * 동일하게 소모해 사용자 존재 여부가 응답 시간으로 노출되지 않게 한다.
   */
  async verifyDummyPassword(plain: string): Promise<boolean> {
    const dummyHash = await dummyHashPromise;
    await argon2.verify(dummyHash, plain).catch(() => false);
    return false;
  }
}

import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { User } from '@database/entities/user.entity';

// 타이밍 공격 방어용 dummy hash — process 단위로 1회 생성해 재사용.
const dummyHashPromise = argon2.hash(randomBytes(32).toString('hex'));

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
    // argon2.verify reject 는 비번 불일치(false)가 아니라 hash 손상(시스템 에러)이다.
    // false 로 흡수하면 401 위장되어 데이터 손상이 늦게 발견되므로 예외를 그대로 전파한다.
    return argon2.verify(user.passwordHash, plain);
  }

  // 사용자 미존재 경로의 응답 시간을 verifyPassword 와 일치시키기 위한 더미 검증.
  async verifyDummyPassword(plain: string): Promise<boolean> {
    const dummyHash = await dummyHashPromise;
    await argon2.verify(dummyHash, plain).catch(() => false);
    return false;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { User } from '@database/entities/user.entity';

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
    // argon2.verify 는 깨진/형식 불일치 hash 를 만나면 reject 한다.
    // 인증 실패는 단일하게 false 로 귀결되고 서버 500 으로 터지지 않도록 예외를 흡수한다.
    return argon2.verify(user.passwordHash, plain).catch(() => false);
  }
}

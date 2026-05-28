import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, '이메일을 입력해 주세요')
    .email('이메일 형식이 올바르지 않습니다'),
  password: z.string().min(1, '비밀번호를 입력해 주세요'),
});

export type LoginInput = z.input<typeof loginSchema>;
export type LoginDto = z.output<typeof loginSchema>;

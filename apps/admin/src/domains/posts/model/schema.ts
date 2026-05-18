import { z } from 'zod';

/**
 * 다양성이 커지면 DB 메서·도메인 설정으로 이동
 */
export const AUTHOR_OPTIONS = ['강병준', 'AI'] as const;
export const CATEGORY_OPTIONS = ['tech', '회고'] as const;

const SLUG_PATTERN = /^[a-z0-9-]+$/;

const emptyToNull = (v: string): string | null => (v.trim() === '' ? null : v.trim());

export const createPostSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'slug 는 필수입니다.')
    .regex(SLUG_PATTERN, '영문 소문자/숫자/하이픈(-) 만 사용할 수 있습니다.'),
  title: z.string().trim().min(1, '제목은 필수입니다.'),
  description: z.string().max(100, '설명은 100자 이하로 작성해 주세요.').transform(emptyToNull),
  contentMdx: z.string().trim().min(1, '본문은 필수입니다.'),
  author: z
    .string()
    .refine((v) => (AUTHOR_OPTIONS as readonly string[]).includes(v), 'author 는 필수입니다.'),
  category: z
    .string()
    .refine((v) => (CATEGORY_OPTIONS as readonly string[]).includes(v), 'category 는 필수입니다.'),
  thumbnailUrl: z
    .string()
    .refine((v) => {
      const t = v.trim();
      if (t === '') return true;
      try {
        new URL(t);
        return true;
      } catch {
        return false;
      }
    }, 'URL 형식이 올바르지 않습니다.')
    .transform(emptyToNull),
});

export type CreatePostInput = z.input<typeof createPostSchema>;
export type CreatePostDto = z.output<typeof createPostSchema>;

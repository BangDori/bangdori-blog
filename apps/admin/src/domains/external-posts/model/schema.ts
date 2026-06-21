import { z } from 'zod';

export const SOURCE_OPTIONS = ['Medium', 'GitHub', 'Velog', 'Blog', 'Other'] as const;

export const createExternalPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, '제목은 필수입니다.')
    .max(200, '제목은 200자 이하로 작성해 주세요.'),
  url: z
    .string()
    .trim()
    .min(1, 'URL은 필수입니다.')
    .refine((value) => {
      try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    }, 'http(s) URL 형식이 올바르지 않습니다.'),
  source: z.string().trim().min(1, 'source는 필수입니다.'),
  category: z.string().trim().min(1, 'category는 필수입니다.'),
});

export const updateExternalPostSchema = createExternalPostSchema.partial();

export type ExternalPostFormInput = z.input<typeof createExternalPostSchema>;
export type CreateExternalPostDto = z.output<typeof createExternalPostSchema>;
export type UpdateExternalPostDto = z.output<typeof updateExternalPostSchema>;

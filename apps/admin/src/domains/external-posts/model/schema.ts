import { z } from 'zod';

export interface ExternalPostFormInput {
  title: string;
  url: string;
  source: string;
  category: string;
  publishedAt: string;
}

export interface CreateExternalPostDto {
  title: string;
  url: string;
  source: string;
  category?: string;
  publishedAt?: string;
}

export interface UpdateExternalPostDto {
  title?: string;
  url?: string;
  source?: string;
  category?: string | null;
  publishedAt?: string | null;
}

export const EMPTY_EXTERNAL_POST_FORM: ExternalPostFormInput = {
  title: '',
  url: '',
  source: '',
  category: '',
  publishedAt: '',
};

const titleSchema = z
  .string()
  .trim()
  .min(1, '제목은 필수입니다.')
  .max(200, '제목은 200자 이하로 작성해 주세요.');

const urlSchema = z
  .string()
  .trim()
  .min(1, 'URL은 필수입니다.')
  .refine((value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }, 'URL 형식이 올바르지 않습니다.');

const sourceSchema = z.string().trim().min(1, 'source는 필수입니다.');

const optionalTextToUndefinedSchema = z.string().transform((value) => {
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
});

const optionalTextToNullSchema = z.string().transform((value) => {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
});

const optionalDatetimeLocalSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || !Number.isNaN(new Date(value).getTime()), {
    message: 'publishedAt 형식이 올바르지 않습니다.',
  });

const publishedAtToUndefinedSchema = optionalDatetimeLocalSchema.transform((value) =>
  value === '' ? undefined : new Date(value).toISOString(),
);

const publishedAtToNullSchema = optionalDatetimeLocalSchema.transform((value) =>
  value === '' ? null : new Date(value).toISOString(),
);

export const createExternalPostSchema = z
  .object({
    title: titleSchema,
    url: urlSchema,
    source: sourceSchema,
    category: optionalTextToUndefinedSchema,
    publishedAt: publishedAtToUndefinedSchema,
  })
  .transform((value): CreateExternalPostDto => {
    const dto: CreateExternalPostDto = {
      title: value.title,
      url: value.url,
      source: value.source,
    };

    if (value.category !== undefined) dto.category = value.category;
    if (value.publishedAt !== undefined) dto.publishedAt = value.publishedAt;

    return dto;
  });

export const updateExternalPostSchema = z
  .object({
    title: titleSchema.optional(),
    url: urlSchema.optional(),
    source: sourceSchema.optional(),
    category: optionalTextToNullSchema.optional(),
    publishedAt: publishedAtToNullSchema.optional(),
  })
  .transform((value): UpdateExternalPostDto => {
    const dto: UpdateExternalPostDto = {};

    if (value.title !== undefined) dto.title = value.title;
    if (value.url !== undefined) dto.url = value.url;
    if (value.source !== undefined) dto.source = value.source;
    if (value.category !== undefined) dto.category = value.category;
    if (value.publishedAt !== undefined) dto.publishedAt = value.publishedAt;

    return dto;
  });

export function toDatetimeLocalValue(value: string | null | undefined): string {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

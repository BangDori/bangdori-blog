import { randomUUID } from 'node:crypto';

export const ALLOWED_UPLOAD_CONTENT_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const;

export type AllowedUploadContentType = (typeof ALLOWED_UPLOAD_CONTENT_TYPES)[number];

const CONTENT_TYPE_TO_EXT: Record<AllowedUploadContentType, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const MAX_SLUG_LENGTH = 60;
const DEFAULT_KEY_PREFIX = 'posts';

interface BuildUploadObjectKeyInput {
  originalFilename: string;
  contentType: AllowedUploadContentType;
  prefix?: string;
  now?: Date;
}

export function buildUploadObjectKey(input: BuildUploadObjectKeyInput): string {
  const now = input.now ?? new Date();
  const yyyy = String(now.getUTCFullYear()).padStart(4, '0');
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const prefix = input.prefix ?? DEFAULT_KEY_PREFIX;
  const slug = slugifyFilename(stripExtension(input.originalFilename));
  const ext = CONTENT_TYPE_TO_EXT[input.contentType];
  const uuid = randomUUID();

  return `${prefix}/${yyyy}/${mm}/${uuid}-${slug}.${ext}`;
}

function stripExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot <= 0) return filename;

  return filename.slice(0, lastDot);
}

function slugifyFilename(input: string): string {
  const normalized = input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const collapsed = normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const truncated = collapsed.slice(0, MAX_SLUG_LENGTH).replace(/-+$/g, '');

  return truncated.length > 0 ? truncated : 'file';
}

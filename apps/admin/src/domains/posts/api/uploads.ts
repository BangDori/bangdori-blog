import { api, formatError } from '@shared/lib/http';

const ALLOWED_POST_IMAGE_CONTENT_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const;

export const INVALID_POST_IMAGE_TYPE_MESSAGE =
  'PNG, JPEG, WebP, GIF 이미지만 업로드할 수 있습니다.';

export type AllowedPostImageContentType = (typeof ALLOWED_POST_IMAGE_CONTENT_TYPES)[number];

interface PresignUploadDto {
  contentType: AllowedPostImageContentType;
  originalFilename: string;
}

export interface PresignUploadResponse {
  key: string;
  uploadUrl: string;
  publicUrl: string;
  expiresInSec: number;
}

export function isAllowedPostImageContentType(
  contentType: string,
): contentType is AllowedPostImageContentType {
  return ALLOWED_POST_IMAGE_CONTENT_TYPES.includes(contentType as AllowedPostImageContentType);
}

function presignUpload(dto: PresignUploadDto): Promise<PresignUploadResponse> {
  return api.post<PresignUploadResponse>('/admin/uploads/presign', dto);
}

export async function uploadPostImage(file: File): Promise<PresignUploadResponse> {
  if (!isAllowedPostImageContentType(file.type)) {
    throw new Error(INVALID_POST_IMAGE_TYPE_MESSAGE);
  }

  let presigned: PresignUploadResponse;
  try {
    presigned = await presignUpload({
      contentType: file.type,
      originalFilename: file.name,
    });
  } catch (err) {
    throw new Error(`업로드 URL 발급에 실패했습니다. ${describeUploadError(err)}`);
  }

  let response: Response;
  try {
    response = await fetch(presigned.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
      credentials: 'omit',
    });
  } catch (err) {
    throw new Error(`이미지 업로드에 실패했습니다. ${describeUploadError(err)}`);
  }

  if (!response.ok) {
    throw new Error(`이미지 업로드에 실패했습니다. (${response.status})`);
  }

  return presigned;
}

function describeUploadError(err: unknown): string {
  if (err instanceof Error) return formatError(err);
  return '알 수 없는 오류';
}

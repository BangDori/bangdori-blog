import { useState } from 'react';
import { toast } from 'sonner';
import { ImagePicker } from '@shared/ui/image-picker';
import {
  INVALID_POST_IMAGE_TYPE_MESSAGE,
  isAllowedPostImageContentType,
  uploadPostImage,
} from '../api/uploads';

interface PostThumbnailPickerProps {
  url: string;
  disabled: boolean;
  error: string | undefined;
  onUrlChange: (next: string) => void;
  onUploadingChange: (uploading: boolean) => void;
}

export function PostThumbnailPicker({
  url,
  disabled,
  error,
  onUrlChange,
  onUploadingChange,
}: PostThumbnailPickerProps) {
  const [isUploading, setIsUploading] = useState(false);

  const setUploading = (uploading: boolean) => {
    setIsUploading(uploading);
    onUploadingChange(uploading);
  };

  async function handleFileSelect(file: File) {
    if (!isAllowedPostImageContentType(file.type)) {
      toast.error(INVALID_POST_IMAGE_TYPE_MESSAGE);
      return;
    }

    setUploading(true);
    try {
      const uploaded = await uploadPostImage(file);
      onUrlChange(uploaded.publicUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '썸네일 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <ImagePicker
      url={url}
      disabled={disabled}
      error={error}
      uploading={isUploading}
      onFileSelect={(file) => void handleFileSelect(file)}
      onUrlChange={onUrlChange}
    />
  );
}

import { useEffect, useRef } from 'react';
import { Icon } from '@shared/icons';
import { cn } from '@shared/lib/cn';

interface ImagePickerProps {
  url: string;
  disabled: boolean;
  error?: string;
  uploading?: boolean;
  emptyLabel?: string;
  uploadingLabel?: string;
  onFileSelect?: (file: File) => void;
  onUrlChange: (next: string) => void;
}

export function ImagePicker({
  url,
  disabled,
  error,
  uploading = false,
  emptyLabel = '이미지를 클릭해 선택',
  uploadingLabel = '업로드 중…',
  onFileSelect,
  onUrlChange,
}: ImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function applyFile(file: File | null | undefined) {
    if (!file) return;
    if (onFileSelect) {
      onFileSelect(file);
      return;
    }
    if (!file.type.startsWith('image/')) return;

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);

    const blobUrl = URL.createObjectURL(file);
    objectUrlRef.current = blobUrl;
    onUrlChange(blobUrl);
  }

  function handleClear() {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    onUrlChange('');
  }

  return (
    <div className="space-y-1">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        disabled={disabled || uploading}
        onChange={(e) => {
          applyFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <div className="relative aspect-video overflow-hidden rounded-md border border-border bg-secondary">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          aria-label={url ? '이미지 교체' : '이미지 선택'}
          className={cn(
            'flex h-full w-full cursor-pointer items-center justify-center text-sm text-muted-foreground transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            !url && 'hover:bg-secondary/60',
          )}
        >
          {url ? (
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="px-4 text-center">{uploading ? uploadingLabel : emptyLabel}</span>
          )}
        </button>
        {uploading && url && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-sm text-muted-foreground">
            {uploadingLabel}
          </div>
        )}
        {url && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled || uploading}
            aria-label="이미지 제거"
            className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-md bg-background/80 text-foreground shadow-sm transition-colors hover:bg-background disabled:opacity-50"
          >
            <Icon name="close" className="size-4" />
          </button>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

import { type FormEvent, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@shared/ui/button';
import type { CreatePostInput } from '../model/schema';
import { PostBodyEditor } from './post-body-editor';

interface PostCreateWriteStepProps {
  disabled: boolean;
  onCancel: () => void;
  onNext: () => void;
}

export function PostCreateWriteStep({ disabled, onCancel, onNext }: PostCreateWriteStepProps) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CreatePostInput>();
  const title = useWatch({ control, name: 'title' });
  const contentMdx = useWatch({ control, name: 'contentMdx' });
  const [isBodyUploading, setIsBodyUploading] = useState(false);
  const canProceed = title.trim() !== '' && contentMdx.trim() !== '';
  const canMoveNext = !disabled && !isBodyUploading && canProceed;

  const moveNext = () => {
    if (!canMoveNext) return;
    onNext();
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    moveNext();
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={disabled || isBodyUploading}>
          취소
        </Button>
        <Button onClick={moveNext} disabled={!canMoveNext}>
          {isBodyUploading ? '이미지 업로드 중…' : '미리보기'}
        </Button>
      </div>

      <form onSubmit={onSubmit} noValidate>
        <div className="mx-auto max-w-7xl">
          <PostBodyEditor
            title={title}
            contentMdx={contentMdx}
            disabled={disabled}
            titleError={errors.title?.message}
            contentError={errors.contentMdx?.message}
            onTitleChange={(v) => setValue('title', v, { shouldDirty: true })}
            onContentChange={(v) => setValue('contentMdx', v, { shouldDirty: true })}
            onUploadingChange={setIsBodyUploading}
          />
        </div>
      </form>
    </div>
  );
}

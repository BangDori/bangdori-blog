import { type FormEvent, type KeyboardEvent, type UIEvent, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@shared/ui/button';
import { MarkdownPreview } from '@shared/ui/markdown-preview';
import type { CreatePostInput } from '../model/schema';

interface PostCreateWriteStepProps {
  disabled: boolean;
  onCancel: () => void;
  onNext: () => void;
}

export function PostCreateWriteStep({ disabled, onCancel, onNext }: PostCreateWriteStepProps) {
  const { control } = useFormContext<CreatePostInput>();
  const title = useWatch({ control, name: 'title' });
  const contentMdx = useWatch({ control, name: 'contentMdx' });
  const canProceed = title.trim() !== '' && contentMdx.trim() !== '';

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onNext();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      // 버튼(`disabled || !canProceed`)과 일관되게 단축키도 제한.
      if (disabled || !canProceed) return;
      e.preventDefault();
      onNext();
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={disabled}>
          취소
        </Button>
        <Button onClick={onNext} disabled={disabled || !canProceed}>
          미리보기
        </Button>
      </div>

      <form onSubmit={onSubmit} onKeyDown={onKeyDown} noValidate>
        <WriteBody disabled={disabled} />
      </form>
    </div>
  );
}

interface WriteBodyProps {
  disabled: boolean;
}

function WriteBody({ disabled }: WriteBodyProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreatePostInput>();
  const contentMdx = useWatch({ control, name: 'contentMdx' });
  const previewRef = useRef<HTMLDivElement | null>(null);

  // editor 스크롤 비율을 preview 에 그대로 매핑
  function handleEditorScroll(e: UIEvent<HTMLTextAreaElement>) {
    const editor = e.currentTarget;
    const preview = previewRef.current;
    if (!preview) return;
    const editorMax = editor.scrollHeight - editor.clientHeight;
    const previewMax = preview.scrollHeight - preview.clientHeight;
    if (editorMax <= 0 || previewMax <= 0) return;
    preview.scrollTop = (editor.scrollTop / editorMax) * previewMax;
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="space-y-4">
        <div>
          <input
            {...register('title')}
            id="title"
            type="text"
            placeholder="제목"
            disabled={disabled}
            aria-invalid={!!errors.title || undefined}
            className="block w-full border-0 bg-transparent p-0 text-4xl font-bold tracking-tight text-foreground placeholder:text-muted-foreground/40 focus-visible:outline-none disabled:opacity-50"
          />
          {errors.title?.message && (
            <p role="alert" className="mt-1.5 text-xs text-destructive">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="grid h-[75vh] gap-6 pt-4 md:grid-cols-2">
          <div className="flex flex-col">
            <textarea
              {...register('contentMdx')}
              id="contentMdx"
              placeholder="MDX로 본문을 작성하세요…"
              spellCheck={false}
              disabled={disabled}
              aria-invalid={!!errors.contentMdx || undefined}
              onScroll={handleEditorScroll}
              className="block w-full flex-1 resize-none overflow-y-auto border-0 bg-transparent p-0 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus-visible:outline-none disabled:opacity-50"
            />
            {errors.contentMdx?.message && (
              <p role="alert" className="mt-1.5 text-xs text-destructive">
                {errors.contentMdx.message}
              </p>
            )}
          </div>
          <div ref={previewRef} className="overflow-y-auto border-border md:border-l md:pl-6">
            {contentMdx.trim() === '' ? (
              <p className="text-sm text-muted-foreground/60">
                입력하면 이곳에 미리보기가 표시됩니다.
              </p>
            ) : (
              <MarkdownPreview source={contentMdx} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

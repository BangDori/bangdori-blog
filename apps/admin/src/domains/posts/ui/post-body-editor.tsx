import { type DragEvent, type UIEvent, useRef, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@shared/lib/cn';
import { MarkdownPreview } from '@shared/ui/markdown-preview';
import {
  INVALID_POST_IMAGE_TYPE_MESSAGE,
  isAllowedPostImageContentType,
  uploadPostImage,
} from '../api/uploads';

interface PostBodyEditorProps {
  title: string;
  contentMdx: string;
  disabled?: boolean;
  titleError?: string;
  contentError?: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
}

interface TextSelection {
  start: number;
  end: number;
}

export function PostBodyEditor({
  title,
  contentMdx,
  disabled = false,
  titleError,
  contentError,
  onTitleChange,
  onContentChange,
}: PostBodyEditorProps) {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const isContentDisabled = disabled || isUploadingImage;

  function handleEditorScroll(e: UIEvent<HTMLTextAreaElement>) {
    const editor = e.currentTarget;
    const preview = previewRef.current;
    if (!preview) return;
    const editorMax = editor.scrollHeight - editor.clientHeight;
    const previewMax = preview.scrollHeight - preview.clientHeight;
    if (editorMax <= 0 || previewMax <= 0) return;
    preview.scrollTop = (editor.scrollTop / editorMax) * previewMax;
  }

  function handleDragEnter(e: DragEvent<HTMLTextAreaElement>) {
    if (!hasDraggedFiles(e)) return;
    e.preventDefault();
    if (!isContentDisabled) setIsDragActive(true);
  }

  function handleDragOver(e: DragEvent<HTMLTextAreaElement>) {
    if (!hasDraggedFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = isContentDisabled ? 'none' : 'copy';
    if (!isContentDisabled) setIsDragActive(true);
  }

  function handleDragLeave(e: DragEvent<HTMLTextAreaElement>) {
    if (!hasDraggedFiles(e)) return;
    setIsDragActive(false);
  }

  async function handleDrop(e: DragEvent<HTMLTextAreaElement>) {
    if (!hasDraggedFiles(e)) return;
    e.preventDefault();
    setIsDragActive(false);

    if (disabled) return;
    if (isUploadingImage) {
      toast.error('이미지 업로드가 끝난 뒤 다시 시도해 주세요.');
      return;
    }

    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!isAllowedPostImageContentType(file.type)) {
      toast.error(INVALID_POST_IMAGE_TYPE_MESSAGE);
      return;
    }

    const selection = currentSelection(textareaRef.current, contentMdx.length);
    setIsUploadingImage(true);

    try {
      const uploaded = await uploadPostImage(file);
      const markdown = `![${imageAltFromFilename(file.name)}](${uploaded.publicUrl})`;
      const inserted = insertMarkdownImage(contentMdx, selection, markdown);
      onContentChange(inserted.value);
      requestAnimationFrame(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.focus();
        textarea.setSelectionRange(inserted.cursor, inserted.cursor);
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '본문 이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploadingImage(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="제목"
          disabled={disabled}
          aria-invalid={!!titleError || undefined}
          className="block w-full border-0 bg-transparent p-0 text-4xl font-bold tracking-tight text-foreground placeholder:text-muted-foreground/40 focus-visible:outline-none disabled:opacity-50"
        />
        {titleError && (
          <p role="alert" className="mt-1.5 text-xs text-destructive">
            {titleError}
          </p>
        )}
      </div>

      <div className="grid h-[70vh] gap-6 pt-4 md:grid-cols-2">
        <div
          className={cn(
            'flex min-h-0 flex-col rounded-md border border-transparent transition-colors',
            isDragActive && 'border-primary/60 bg-accent/40',
          )}
        >
          <textarea
            ref={textareaRef}
            id="contentMdx"
            value={contentMdx}
            onChange={(e) => onContentChange(e.target.value)}
            onScroll={handleEditorScroll}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => void handleDrop(e)}
            placeholder="MDX로 본문을 작성하세요…"
            spellCheck={false}
            disabled={isContentDisabled}
            aria-invalid={!!contentError || undefined}
            className="block w-full min-h-0 flex-1 resize-none overflow-y-auto border-0 bg-transparent p-0 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus-visible:outline-none disabled:opacity-50"
          />
          <p className="mt-2 min-h-5 text-xs text-muted-foreground">
            {isUploadingImage
              ? '이미지 업로드 중… 완료 후 본문에 삽입됩니다.'
              : '이미지 파일을 드래그해 본문에 삽입할 수 있어요.'}
          </p>
          {contentError && (
            <p role="alert" className="mt-1.5 text-xs text-destructive">
              {contentError}
            </p>
          )}
        </div>
        <div ref={previewRef} className="overflow-y-auto border-border md:border-l md:pl-6">
          {contentMdx === '' ? (
            <p className="text-sm text-muted-foreground/60">
              입력하면 이곳에 미리보기가 표시됩니다.
            </p>
          ) : (
            <MarkdownPreview source={contentMdx} />
          )}
        </div>
      </div>
    </div>
  );
}

function hasDraggedFiles(e: DragEvent<HTMLElement>): boolean {
  return Array.from(e.dataTransfer.types).includes('Files');
}

function currentSelection(textarea: HTMLTextAreaElement | null, fallback: number): TextSelection {
  if (!textarea) return { start: fallback, end: fallback };
  return { start: textarea.selectionStart, end: textarea.selectionEnd };
}

function imageAltFromFilename(filename: string): string {
  const withoutExtension = filename.replace(/\.[^./\\]+$/, '').trim();
  const alt = withoutExtension || filename.trim() || 'image';
  return (
    alt
      .replace(/\[/g, ' ')
      .replace(/\]/g, ' ')
      .replace(/[\n\r]+/g, ' ')
      .trim() || 'image'
  );
}

function insertMarkdownImage(source: string, selection: TextSelection, markdown: string) {
  const start = Math.min(selection.start, selection.end);
  const end = Math.max(selection.start, selection.end);
  const before = source.slice(0, start);
  const after = source.slice(end);
  const prefix = before === '' || before.endsWith('\n') ? '' : '\n\n';
  const suffix = after === '' || after.startsWith('\n') ? '' : '\n\n';
  const value = `${before}${prefix}${markdown}${suffix}${after}`;

  return {
    value,
    cursor: before.length + prefix.length + markdown.length,
  };
}

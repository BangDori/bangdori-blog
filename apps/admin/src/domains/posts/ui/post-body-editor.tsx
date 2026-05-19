import { type UIEvent, useRef } from 'react';
import { MarkdownPreview } from '@shared/ui/markdown-preview';

interface PostBodyEditorProps {
  title: string;
  contentMdx: string;
  disabled?: boolean;
  titleError?: string;
  contentError?: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
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
        <div className="flex flex-col">
          <textarea
            id="contentMdx"
            value={contentMdx}
            onChange={(e) => onContentChange(e.target.value)}
            onScroll={handleEditorScroll}
            placeholder="MDX로 본문을 작성하세요…"
            spellCheck={false}
            disabled={disabled}
            aria-invalid={!!contentError || undefined}
            className="block w-full flex-1 resize-none overflow-y-auto border-0 bg-transparent p-0 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus-visible:outline-none disabled:opacity-50"
          />
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

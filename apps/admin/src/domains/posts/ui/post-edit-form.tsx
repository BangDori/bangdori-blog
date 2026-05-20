import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { ErrorAlert } from '@shared/ui/alert';
import { Button } from '@shared/ui/button';
import { Field } from '@shared/ui/field';
import { ImagePicker } from '@shared/ui/image-picker';
import { Input } from '@shared/ui/input';
import { NativeSelect } from '@shared/ui/native-select';
import { describeUpdatePostError } from '../api/errors';
import { useUpdatePost } from '../api/mutations';
import {
  AUTHOR_OPTIONS,
  CATEGORY_OPTIONS,
  type UpdatePostDto,
  type UpdatePostInput,
  updatePostSchema,
} from '../model/schema';
import type { Post } from '../model/types';
import { PostBodyEditor } from './post-body-editor';

interface PostEditFormProps {
  post: Post;
}

type FormState = Required<UpdatePostInput>;
type FieldErrors = Partial<Record<keyof FormState, string>>;

/** 사용자가 의미 있게 변경한 필드 키만 골라낸다 (trim 비교) */
function dirtyKeys(initial: FormState, current: FormState): (keyof FormState)[] {
  const keys: (keyof FormState)[] = [];
  for (const key of Object.keys(current) as (keyof FormState)[]) {
    if (current[key].trim() !== initial[key].trim()) keys.push(key);
  }
  return keys;
}

export function PostEditForm({ post }: PostEditFormProps) {
  const initialState = useMemo<FormState>(
    () => ({
      slug: post.slug,
      title: post.title,
      description: post.description ?? '',
      contentMdx: post.contentMdx,
      author: post.author,
      category: post.category,
      thumbnailUrl: post.thumbnailUrl ?? '',
    }),
    [post],
  );
  const [state, setState] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const mutation = useUpdatePost(post.id);

  // 캠시 갱신으로 initial 이 새로 내려오면 폼 초기값을 따라가되, 사용자가 입력 중이면(dirty)
  // 미저장 값이 덮어쓰이지 않도록 skip 한다. 저장 성공 시점에는 dirty 가 0 개라
  // 자연스럽게 reset 된다 (서버 응답 == 사용자 입력).
  useEffect(() => {
    setState((prev) => (dirtyKeys(initialState, prev).length > 0 ? prev : initialState));
    setErrors((prev) => (Object.keys(prev).length > 0 ? {} : prev));
  }, [initialState]);

  const dirty = dirtyKeys(initialState, state);
  const isDirty = dirty.length > 0;
  const isSubmitting = mutation.isPending;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    setSavedAt(null);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || !isDirty) return;

    // 변경된 필드만 zod 로 검증 → transform(emptyToNull) 까지 적용된 결과가 payload
    const partial = Object.fromEntries(dirty.map((k) => [k, state[k]])) as Partial<FormState>;
    const result = updatePostSchema.safeParse(partial);

    if (!result.success) {
      const next: FieldErrors = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof FormState | undefined;
        if (path && !next[path]) next[path] = issue.message;
      }
      setErrors(next);
      return;
    }

    const payload: UpdatePostDto = result.data;
    mutation.mutate(payload, {
      onSuccess: () => setSavedAt(new Date().toISOString()),
    });
  };

  const submitError = mutation.error ? describeUpdatePostError(mutation.error) : null;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-10">
      {submitError && <ErrorAlert>{submitError}</ErrorAlert>}
      {!submitError && savedAt && (
        <div className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground">
          저장되었습니다.
        </div>
      )}

      <PostEditSection state={state} errors={errors} disabled={isSubmitting} update={update} />

      <PostBodyEditor
        title={state.title}
        contentMdx={state.contentMdx}
        disabled={isSubmitting}
        titleError={errors.title}
        contentError={errors.contentMdx}
        onTitleChange={(v) => update('title', v)}
        onContentChange={(v) => update('contentMdx', v)}
      />

      <div className="flex items-center justify-end gap-3">
        <span className="text-xs text-muted-foreground">
          {isDirty ? `변경된 필드: ${dirty.length}개` : '변경 사항 없음'}
        </span>
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? '저장 중…' : '수정 저장'}
        </Button>
      </div>
    </form>
  );
}

interface PostEditSectionProps {
  state: FormState;
  errors: FieldErrors;
  disabled: boolean;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}

function PostEditSection({ state, errors, disabled, update }: PostEditSectionProps) {
  return (
    <section className="grid gap-8 md:grid-cols-2">
      <Field htmlFor="thumbnailUrl" label="thumbnailUrl" hint="선택" error={errors.thumbnailUrl}>
        <ImagePicker
          url={state.thumbnailUrl}
          disabled={disabled}
          onUrlChange={(next) => update('thumbnailUrl', next)}
        />
      </Field>

      <div className="space-y-5">
        <Field htmlFor="slug" label="slug" required error={errors.slug}>
          <Input
            id="slug"
            value={state.slug}
            onChange={(e) => update('slug', e.target.value)}
            placeholder="my-first-post"
            autoComplete="off"
            spellCheck={false}
            invalid={!!errors.slug}
            disabled={disabled}
          />
        </Field>

        <Field htmlFor="description" label="description" hint="선택" error={errors.description}>
          <div className="space-y-1">
            <textarea
              id="description"
              value={state.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="한 문장 소개 (선택)"
              maxLength={100}
              rows={3}
              disabled={disabled}
              className="block w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none"
            />
            <p className="text-[11px] tabular-nums text-muted-foreground/60">
              {state.description.length}/100
            </p>
          </div>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field htmlFor="author" label="author" required error={errors.author}>
            <NativeSelect
              id="author"
              value={state.author}
              onChange={(e) => update('author', e.target.value)}
              options={AUTHOR_OPTIONS}
              invalid={!!errors.author}
              disabled={disabled}
            />
          </Field>

          <Field htmlFor="category" label="category" required error={errors.category}>
            <NativeSelect
              id="category"
              value={state.category}
              onChange={(e) => update('category', e.target.value)}
              options={CATEGORY_OPTIONS}
              invalid={!!errors.category}
              disabled={disabled}
            />
          </Field>
        </div>
      </div>
    </section>
  );
}

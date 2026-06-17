import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ApiError } from '@shared/lib/http';
import { ROUTES } from '@shared/lib/routes';
import { Button } from '@shared/ui/button';
import { Field } from '@shared/ui/field';
import { Input } from '@shared/ui/input';
import { describeDeleteExternalPostError, describeUpdateExternalPostError } from '../api/errors';
import { useDeleteExternalPost, useUpdateExternalPost } from '../api/mutations';
import {
  type CreateExternalPostDto,
  createExternalPostSchema,
  EMPTY_EXTERNAL_POST_FORM,
  type ExternalPostFormInput,
  toDatetimeLocalValue,
  type UpdateExternalPostDto,
  updateExternalPostSchema,
} from '../model/schema';
import type { ExternalPost } from '../model/types';

type ExternalPostFormField = keyof ExternalPostFormInput;
type FieldErrors = Partial<Record<ExternalPostFormField, string>>;

const FORM_FIELDS = ['title', 'url', 'source', 'category', 'publishedAt'] as const;

function dirtyKeys(
  initial: ExternalPostFormInput,
  current: ExternalPostFormInput,
): ExternalPostFormField[] {
  const keys: ExternalPostFormField[] = [];

  for (const key of FORM_FIELDS) {
    if (current[key].trim() !== initial[key].trim()) keys.push(key);
  }

  return keys;
}

function collectFieldErrors(issues: { path: PropertyKey[]; message: string }[]): FieldErrors {
  const next: FieldErrors = {};

  for (const issue of issues) {
    const path = issue.path[0] as ExternalPostFormField | undefined;
    if (path && !next[path]) next[path] = issue.message;
  }

  return next;
}

function notFoundAction(err: Error, onClick: () => void) {
  if (err instanceof ApiError && err.status === 404) {
    return { action: { label: '목록으로', onClick } };
  }
  return undefined;
}

interface ExternalPostCreateFormProps {
  disabled: boolean;
  onCancel: () => void;
  onSubmit: (dto: CreateExternalPostDto) => void;
}

export function ExternalPostCreateForm({
  disabled,
  onCancel,
  onSubmit,
}: ExternalPostCreateFormProps) {
  const [state, setState] = useState<ExternalPostFormInput>(EMPTY_EXTERNAL_POST_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});

  const update = <K extends ExternalPostFormField>(key: K, value: ExternalPostFormInput[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disabled) return;

    const result = createExternalPostSchema.safeParse(state);

    if (!result.success) {
      setErrors(collectFieldErrors(result.error.issues));
      return;
    }

    onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <ExternalPostFields state={state} errors={errors} disabled={disabled} update={update} />
      <ExternalPostCreateActions disabled={disabled} onCancel={onCancel} />
    </form>
  );
}

interface ExternalPostEditFormProps {
  post: ExternalPost;
}

export function ExternalPostEditForm({ post }: ExternalPostEditFormProps) {
  const navigate = useNavigate();
  const initialState = useMemo<ExternalPostFormInput>(
    () => ({
      title: post.title,
      url: post.url,
      source: post.source,
      category: post.category ?? '',
      publishedAt: toDatetimeLocalValue(post.publishedAt),
    }),
    [post],
  );
  const [state, setState] = useState<ExternalPostFormInput>(initialState);
  const [errors, setErrors] = useState<FieldErrors>({});

  const updateMutation = useUpdateExternalPost(post.id);
  const deleteMutation = useDeleteExternalPost(post.id);

  useEffect(() => {
    setState((prev) => (dirtyKeys(initialState, prev).length > 0 ? prev : initialState));
    setErrors((prev) => (Object.keys(prev).length > 0 ? {} : prev));
  }, [initialState]);

  const dirty = dirtyKeys(initialState, state);
  const isDirty = dirty.length > 0;
  const isSubmitting = updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const isBusy = isSubmitting || isDeleting;
  const goToList = () => navigate(ROUTES.externalPosts);

  const update = <K extends ExternalPostFormField>(key: K, value: ExternalPostFormInput[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isBusy || !isDirty) return;

    const partial = Object.fromEntries(dirty.map((key) => [key, state[key]]));
    const result = updateExternalPostSchema.safeParse(partial);

    if (!result.success) {
      setErrors(collectFieldErrors(result.error.issues));
      return;
    }

    const payload: UpdateExternalPostDto = result.data;
    updateMutation.mutate(payload, {
      onSuccess: () => toast.success('저장되었습니다.'),
      onError: (err) =>
        toast.error(describeUpdateExternalPostError(err), notFoundAction(err, goToList)),
    });
  };

  const handleDelete = () => {
    if (isBusy) return;
    if (
      !window.confirm(
        '이 외부 글을 삭제하시겠습니까?\n삭제하면 복구할 수 없습니다. 계속하시겠습니까?',
      )
    )
      return;

    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('삭제되었습니다.');
        navigate(ROUTES.externalPosts);
      },
      onError: (err) =>
        toast.error(describeDeleteExternalPostError(err), notFoundAction(err, goToList)),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <ExternalPostFields state={state} errors={errors} disabled={isBusy} update={update} />
      <ExternalPostEditActions
        dirtyCount={dirty.length}
        disabled={isBusy}
        isDirty={isDirty}
        isDeleting={isDeleting}
        isSubmitting={isSubmitting}
        onDelete={handleDelete}
      />
    </form>
  );
}

interface ExternalPostFieldsProps {
  state: ExternalPostFormInput;
  errors: FieldErrors;
  disabled: boolean;
  update: <K extends ExternalPostFormField>(key: K, value: ExternalPostFormInput[K]) => void;
}

function ExternalPostFields({ state, errors, disabled, update }: ExternalPostFieldsProps) {
  return (
    <section className="grid gap-5 md:grid-cols-2">
      <Field htmlFor="title" label="title" required error={errors.title} className="md:col-span-2">
        <div className="space-y-1">
          <Input
            id="title"
            value={state.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="외부 글 제목"
            maxLength={200}
            autoComplete="off"
            invalid={!!errors.title}
            disabled={disabled}
          />
          <p className="text-[11px] tabular-nums text-muted-foreground/60">
            {state.title.length}/200
          </p>
        </div>
      </Field>

      <Field htmlFor="url" label="url" required error={errors.url} className="md:col-span-2">
        <Input
          id="url"
          type="url"
          value={state.url}
          onChange={(e) => update('url', e.target.value)}
          placeholder="https://example.com/post"
          autoComplete="url"
          spellCheck={false}
          invalid={!!errors.url}
          disabled={disabled}
        />
      </Field>

      <Field htmlFor="source" label="source" required error={errors.source}>
        <Input
          id="source"
          value={state.source}
          onChange={(e) => update('source', e.target.value)}
          placeholder="Medium, GitHub, Velog…"
          autoComplete="off"
          invalid={!!errors.source}
          disabled={disabled}
        />
      </Field>

      <Field htmlFor="category" label="category" hint="선택" error={errors.category}>
        <Input
          id="category"
          value={state.category}
          onChange={(e) => update('category', e.target.value)}
          placeholder="tech, 회고…"
          autoComplete="off"
          invalid={!!errors.category}
          disabled={disabled}
        />
      </Field>

      <Field
        htmlFor="publishedAt"
        label="publishedAt"
        hint="선택 · 브라우저 로컬 시간"
        error={errors.publishedAt}
      >
        <Input
          id="publishedAt"
          type="datetime-local"
          value={state.publishedAt}
          onChange={(e) => update('publishedAt', e.target.value)}
          invalid={!!errors.publishedAt}
          disabled={disabled}
        />
      </Field>
    </section>
  );
}

interface ExternalPostCreateActionsProps {
  disabled: boolean;
  onCancel: () => void;
}

function ExternalPostCreateActions({ disabled, onCancel }: ExternalPostCreateActionsProps) {
  return (
    <section
      aria-label="외부 글 생성 액션"
      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-secondary/30 p-4"
    >
      <Button variant="outline" onClick={onCancel} disabled={disabled}>
        취소
      </Button>
      <Button type="submit" disabled={disabled}>
        {disabled ? '등록 중…' : '등록하기'}
      </Button>
    </section>
  );
}

interface ExternalPostEditActionsProps {
  dirtyCount: number;
  disabled: boolean;
  isDirty: boolean;
  isDeleting: boolean;
  isSubmitting: boolean;
  onDelete: () => void;
}

function ExternalPostEditActions({
  dirtyCount,
  disabled,
  isDirty,
  isDeleting,
  isSubmitting,
  onDelete,
}: ExternalPostEditActionsProps) {
  return (
    <section
      aria-label="외부 글 수정 액션"
      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-secondary/30 p-4"
    >
      <Button variant="destructive" onClick={onDelete} disabled={disabled}>
        {isDeleting ? '삭제 중…' : '삭제'}
      </Button>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-muted-foreground">
          {isDirty ? `변경된 필드: ${dirtyCount}개` : '변경 사항 없음'}
        </span>
        <Button type="submit" disabled={disabled || !isDirty}>
          {isSubmitting ? '저장 중…' : '저장하기'}
        </Button>
      </div>
    </section>
  );
}

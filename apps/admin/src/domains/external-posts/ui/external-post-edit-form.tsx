import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ApiError } from '@shared/lib/http';
import { ROUTES } from '@shared/lib/routes';
import {
  describeArchiveExternalPostError,
  describeDeleteExternalPostError,
  describePublishExternalPostError,
  describeUpdateExternalPostError,
} from '../api/errors';
import {
  useArchiveExternalPost,
  useDeleteExternalPost,
  usePublishExternalPost,
  useUpdateExternalPost,
} from '../api/mutations';
import { type ExternalPostFormInput, updateExternalPostSchema } from '../model/schema';
import type { ExternalPost } from '../model/types';
import { ExternalPostEditActions } from './external-post-edit-actions';
import {
  collectExternalPostFieldErrors,
  EXTERNAL_POST_FORM_FIELDS,
  type ExternalPostFieldErrors,
  ExternalPostFields,
  type ExternalPostFormField,
  focusFirstExternalPostFieldError,
} from './external-post-fields';

interface ExternalPostEditFormProps {
  post: ExternalPost;
}

function toFormInput(post: ExternalPost): ExternalPostFormInput {
  return {
    title: post.title,
    url: post.url,
    source: post.source,
    category: post.category,
  };
}

function dirtyKeys(
  initial: ExternalPostFormInput,
  current: ExternalPostFormInput,
): ExternalPostFormField[] {
  const keys: ExternalPostFormField[] = [];

  for (const key of EXTERNAL_POST_FORM_FIELDS) {
    if (current[key].trim() !== initial[key].trim()) keys.push(key);
  }

  return keys;
}

function notFoundAction(err: Error, onClick: () => void) {
  if (err instanceof ApiError && err.status === 404) {
    return { action: { label: '목록으로', onClick } };
  }
  return undefined;
}

export function ExternalPostEditForm({ post }: ExternalPostEditFormProps) {
  const navigate = useNavigate();
  const initialValue = useMemo(() => toFormInput(post), [post]);
  const [value, setValue] = useState<ExternalPostFormInput>(initialValue);
  const [errors, setErrors] = useState<ExternalPostFieldErrors>({});

  const updateMutation = useUpdateExternalPost(post.id);
  const publishMutation = usePublishExternalPost(post.id);
  const archiveMutation = useArchiveExternalPost(post.id);
  const deleteMutation = useDeleteExternalPost(post.id);

  useEffect(() => {
    setValue((prev) => (dirtyKeys(initialValue, prev).length > 0 ? prev : initialValue));
    setErrors((prev) => (Object.keys(prev).length > 0 ? {} : prev));
  }, [initialValue]);

  const dirty = dirtyKeys(initialValue, value);
  const isDirty = dirty.length > 0;
  const isSubmitting = updateMutation.isPending;
  const isPublishing = publishMutation.isPending;
  const isArchiving = archiveMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const isBusy = isSubmitting || isPublishing || isArchiving || isDeleting;
  const goToList = () => navigate(ROUTES.externalPosts);

  const update = <K extends ExternalPostFormField>(key: K, next: ExternalPostFormInput[K]) => {
    setValue((prev) => ({ ...prev, [key]: next }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isBusy || !isDirty) return;

    const partial = Object.fromEntries(dirty.map((key) => [key, value[key]]));
    const result = updateExternalPostSchema.safeParse(partial);

    if (!result.success) {
      const nextErrors = collectExternalPostFieldErrors(result.error.issues);
      setErrors(nextErrors);
      focusFirstExternalPostFieldError(nextErrors);
      return;
    }

    updateMutation.mutate(result.data, {
      onSuccess: () => toast.success('저장되었습니다.'),
      onError: (err) =>
        toast.error(describeUpdateExternalPostError(err), notFoundAction(err, goToList)),
    });
  };

  const handlePublish = () => {
    if (isBusy || isDirty || post.status === 'published') return;
    if (
      !window.confirm(
        '이 외부 글을 발행하시겠습니까?\n발행 시각은 서버에서 현재 시각으로 기록됩니다.',
      )
    ) {
      return;
    }

    publishMutation.mutate(undefined, {
      onSuccess: () => toast.success('발행되었습니다.'),
      onError: (err) =>
        toast.error(describePublishExternalPostError(err), notFoundAction(err, goToList)),
    });
  };

  const handleArchive = () => {
    if (isBusy || isDirty || post.status === 'archived') return;
    if (!window.confirm('이 외부 글을 보관(archive)하시겠습니까?\n공개 목록에서 숨겨집니다.')) {
      return;
    }

    archiveMutation.mutate(undefined, {
      onSuccess: () => toast.success('보관되었습니다.'),
      onError: (err) =>
        toast.error(describeArchiveExternalPostError(err), notFoundAction(err, goToList)),
    });
  };

  const handleDelete = () => {
    if (isBusy) return;
    if (
      !window.confirm(
        isDirty
          ? '이 외부 글을 삭제하시겠습니까?\n저장되지 않은 변경 사항은 버려집니다.\n삭제하면 복구할 수 없습니다. 계속하시겠습니까?'
          : '이 외부 글을 삭제하시겠습니까?\n삭제하면 복구할 수 없습니다. 계속하시겠습니까?',
      )
    ) {
      return;
    }

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
      <ExternalPostFields value={value} errors={errors} disabled={isBusy} onChange={update} />
      <ExternalPostEditActions
        post={post}
        dirtyCount={dirty.length}
        disabled={isBusy}
        isDirty={isDirty}
        isArchiving={isArchiving}
        isDeleting={isDeleting}
        isPublishing={isPublishing}
        isSubmitting={isSubmitting}
        onArchive={handleArchive}
        onDelete={handleDelete}
        onPublish={handlePublish}
      />
    </form>
  );
}

import { type FormEvent, useState } from 'react';
import { Button } from '@shared/ui/button';
import {
  type CreateExternalPostDto,
  createExternalPostSchema,
  type ExternalPostFormInput,
} from '../model/schema';
import {
  collectExternalPostFieldErrors,
  type ExternalPostFieldErrors,
  ExternalPostFields,
  type ExternalPostFormField,
  focusFirstExternalPostFieldError,
} from './external-post-fields';

const EMPTY_FORM: ExternalPostFormInput = {
  title: '',
  url: '',
  source: '',
  category: '',
};

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
  const [value, setValue] = useState<ExternalPostFormInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<ExternalPostFieldErrors>({});

  const update = <K extends ExternalPostFormField>(key: K, next: ExternalPostFormInput[K]) => {
    setValue((prev) => ({ ...prev, [key]: next }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disabled) return;

    const result = createExternalPostSchema.safeParse(value);

    if (!result.success) {
      const nextErrors = collectExternalPostFieldErrors(result.error.issues);
      setErrors(nextErrors);
      focusFirstExternalPostFieldError(nextErrors);
      return;
    }

    onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <ExternalPostFields value={value} errors={errors} disabled={disabled} onChange={update} />

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
    </form>
  );
}

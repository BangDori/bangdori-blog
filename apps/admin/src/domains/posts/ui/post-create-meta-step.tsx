import type { FormEvent } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Icon } from '@shared/icons';
import { ErrorAlert } from '@shared/ui/alert';
import { Button } from '@shared/ui/button';
import { Field } from '@shared/ui/field';
import { ImagePicker } from '@shared/ui/image-picker';
import { Input } from '@shared/ui/input';
import { NativeSelect } from '@shared/ui/native-select';
import { AUTHOR_OPTIONS, CATEGORY_OPTIONS, type CreatePostInput } from '../model/schema';

interface PostCreateMetaStepProps {
  disabled: boolean;
  submitError: string | null;
  onBack: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export function PostCreateMetaStep({
  disabled,
  submitError,
  onBack,
  onSubmit,
}: PostCreateMetaStepProps) {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          발행 정보
        </span>
        <button
          type="button"
          onClick={onBack}
          disabled={disabled}
          aria-label="작성 화면으로 돌아가기"
          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50 disabled:pointer-events-none"
        >
          <Icon name="close" className="size-5" />
        </button>
      </div>

      <form onSubmit={onSubmit} noValidate>
        <MetaBody submitError={submitError} disabled={disabled} />
      </form>
    </div>
  );
}

interface MetaBodyProps {
  submitError: string | null;
  disabled: boolean;
}

function MetaBody({ submitError, disabled }: MetaBodyProps) {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CreatePostInput>();

  const title = useWatch({ control, name: 'title' });
  const description = useWatch({ control, name: 'description' });
  const thumbnailUrl = useWatch({ control, name: 'thumbnailUrl' });

  return (
    <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          미리보기
        </h2>

        <ImagePicker
          url={thumbnailUrl}
          disabled={disabled}
          error={errors.thumbnailUrl?.message}
          onUrlChange={(next) =>
            setValue('thumbnailUrl', next, { shouldValidate: true, shouldDirty: true })
          }
        />

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">
            {title.trim() || <span className="text-muted-foreground/60">제목 없음</span>}
          </h3>
          <div className="space-y-1">
            <textarea
              {...register('description')}
              id="description"
              placeholder="한 문장 소개 (선택)"
              disabled={disabled}
              maxLength={100}
              rows={3}
              className="block w-full resize-none overflow-y-auto border-0 bg-transparent p-0 text-sm leading-snug text-muted-foreground placeholder:text-muted-foreground/40 focus-visible:outline-none disabled:opacity-50"
            />
            <p className="text-[11px] tabular-nums text-muted-foreground/60">
              {description.length}/100
            </p>
          </div>
        </div>
      </section>

      <div className="space-y-5">
        {submitError && <ErrorAlert>{submitError}</ErrorAlert>}

        <Field htmlFor="slug" label="slug" required error={errors.slug?.message}>
          <Input
            {...register('slug')}
            id="slug"
            placeholder="my-first-post"
            autoComplete="off"
            spellCheck={false}
            invalid={!!errors.slug}
            disabled={disabled}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field htmlFor="author" label="author" required error={errors.author?.message}>
            <NativeSelect
              {...register('author')}
              id="author"
              options={AUTHOR_OPTIONS}
              invalid={!!errors.author}
              disabled={disabled}
            />
          </Field>

          <Field htmlFor="category" label="category" required error={errors.category?.message}>
            <NativeSelect
              {...register('category')}
              id="category"
              options={CATEGORY_OPTIONS}
              invalid={!!errors.category}
              disabled={disabled}
            />
          </Field>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={disabled} className="w-full">
            {disabled ? '발행 중…' : '발행하기'}
          </Button>
        </div>
      </div>
    </div>
  );
}

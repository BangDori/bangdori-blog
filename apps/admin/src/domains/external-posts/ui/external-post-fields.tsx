import { Field } from '@shared/ui/field';
import { Input } from '@shared/ui/input';
import { type ExternalPostFormInput, SOURCE_OPTIONS } from '../model/schema';

export type ExternalPostFormField = keyof ExternalPostFormInput;
export type ExternalPostFieldErrors = Partial<Record<ExternalPostFormField, string>>;

export const EXTERNAL_POST_FORM_FIELDS = ['title', 'url', 'source', 'category'] as const;

function getErrorId(field: ExternalPostFormField) {
  return `external-post-${field}-error`;
}

function getDescribedBy(...ids: (string | undefined)[]) {
  const value = ids.filter(Boolean).join(' ');
  return value || undefined;
}

interface ExternalPostFieldsProps {
  value: ExternalPostFormInput;
  errors: ExternalPostFieldErrors;
  disabled: boolean;
  onChange: <K extends ExternalPostFormField>(key: K, value: ExternalPostFormInput[K]) => void;
}

export function collectExternalPostFieldErrors(
  issues: readonly { path: readonly PropertyKey[]; message: string }[],
): ExternalPostFieldErrors {
  const next: ExternalPostFieldErrors = {};

  for (const issue of issues) {
    const path = issue.path[0] as ExternalPostFormField | undefined;
    if (path && !next[path]) next[path] = issue.message;
  }

  return next;
}

export function focusFirstExternalPostFieldError(errors: ExternalPostFieldErrors) {
  const firstInvalidField = EXTERNAL_POST_FORM_FIELDS.find((field) => errors[field]);
  if (!firstInvalidField) return;

  document.getElementById(firstInvalidField)?.focus();
}

export function ExternalPostFields({ value, errors, disabled, onChange }: ExternalPostFieldsProps) {
  return (
    <section className="grid gap-5 md:grid-cols-2">
      <Field
        htmlFor="title"
        label="title"
        required
        error={errors.title}
        errorId={getErrorId('title')}
        className="md:col-span-2"
      >
        <div className="space-y-1">
          <Input
            id="title"
            value={value.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="외부 글 제목"
            maxLength={200}
            autoComplete="off"
            aria-describedby={getDescribedBy(
              'external-post-title-count',
              errors.title ? getErrorId('title') : undefined,
            )}
            required
            invalid={!!errors.title}
            disabled={disabled}
          />
          <p
            id="external-post-title-count"
            className="text-[11px] tabular-nums text-muted-foreground/60"
          >
            {value.title.length}/200
          </p>
        </div>
      </Field>

      <Field
        htmlFor="url"
        label="url"
        required
        error={errors.url}
        errorId={getErrorId('url')}
        className="md:col-span-2"
      >
        <Input
          id="url"
          type="url"
          value={value.url}
          onChange={(e) => onChange('url', e.target.value)}
          placeholder="https://example.com/post"
          autoComplete="url"
          spellCheck={false}
          aria-describedby={getDescribedBy(errors.url ? getErrorId('url') : undefined)}
          required
          invalid={!!errors.url}
          disabled={disabled}
        />
      </Field>

      <Field
        htmlFor="source"
        label="source"
        required
        error={errors.source}
        errorId={getErrorId('source')}
      >
        <Input
          id="source"
          value={value.source}
          onChange={(e) => onChange('source', e.target.value)}
          placeholder="Medium, GitHub, Velog…"
          autoComplete="off"
          list="external-post-source-options"
          aria-describedby={getDescribedBy(errors.source ? getErrorId('source') : undefined)}
          required
          invalid={!!errors.source}
          disabled={disabled}
        />
        <datalist id="external-post-source-options">
          {SOURCE_OPTIONS.map((source) => (
            <option key={source} value={source} />
          ))}
        </datalist>
      </Field>

      <Field
        htmlFor="category"
        label="category"
        required
        error={errors.category}
        errorId={getErrorId('category')}
      >
        <Input
          id="category"
          value={value.category}
          onChange={(e) => onChange('category', e.target.value)}
          placeholder="tech, 회고…"
          autoComplete="off"
          aria-describedby={getDescribedBy(errors.category ? getErrorId('category') : undefined)}
          required
          invalid={!!errors.category}
          disabled={disabled}
        />
      </Field>
    </section>
  );
}

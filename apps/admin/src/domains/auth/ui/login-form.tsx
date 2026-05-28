import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@shared/ui/button';
import { Field } from '@shared/ui/field';
import { Input } from '@shared/ui/input';
import { describeLoginError } from '../api/errors';
import { useLogin } from '../api/mutations';
import { type LoginDto, type LoginInput, loginSchema } from '../model/schema';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const mutation = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput, undefined, LoginDto>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  });

  const isSubmitting = mutation.isPending;

  const onSubmit = handleSubmit((dto) => {
    mutation.mutate(dto, {
      onSuccess: () => {
        onSuccess?.();
      },
      onError: (err) => {
        toast.error(describeLoginError(err));
      },
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field htmlFor="email" label="이메일" required error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="admin@bangdori.kr"
          invalid={!!errors.email}
          disabled={isSubmitting}
          {...register('email')}
        />
      </Field>

      <Field htmlFor="password" label="비밀번호" required error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="비밀번호"
          invalid={!!errors.password}
          disabled={isSubmitting}
          {...register('password')}
        />
      </Field>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? '로그인 중…' : '로그인'}
      </Button>
    </form>
  );
}

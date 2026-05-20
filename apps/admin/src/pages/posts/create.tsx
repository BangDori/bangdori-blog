import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  type CreatePostDto,
  type CreatePostInput,
  createPostSchema,
  describeCreatePostError,
  PostCreateMetaStep,
  PostCreateWriteStep,
  useCreatePost,
} from '@domains/posts';
import { ROUTES } from '@shared/lib/routes';

const INITIAL: CreatePostInput = {
  slug: '',
  title: '',
  description: '',
  contentMdx: '',
  author: '',
  category: '',
  thumbnailUrl: '',
};

const WRITE_STEP_FIELDS = ['title', 'contentMdx'] as const;

export function PostsCreatePage() {
  const navigate = useNavigate();
  const mutation = useCreatePost();
  const [step, setStep] = useState<'write' | 'meta'>('write');

  const form = useForm<CreatePostInput, unknown, CreatePostDto>({
    defaultValues: INITIAL,
    resolver: zodResolver(createPostSchema),
    mode: 'onSubmit',
  });

  const proceedToMeta = async () => {
    const ok = await form.trigger(WRITE_STEP_FIELDS);
    if (ok) setStep('meta');
  };

  const onSave = form.handleSubmit((dto) => {
    mutation.mutate(dto, {
      onSuccess: (post) => {
        toast.success('발행되었습니다.');
        navigate(ROUTES.postEdit(post.id));
      },
      onError: (err) => toast.error(describeCreatePostError(err)),
    });
  });

  const disabled = mutation.isPending;

  return (
    <FormProvider {...form}>
      {step === 'write' ? (
        <PostCreateWriteStep
          disabled={disabled}
          onCancel={() => navigate(ROUTES.posts)}
          onNext={proceedToMeta}
        />
      ) : (
        <PostCreateMetaStep disabled={disabled} onBack={() => setStep('write')} onSubmit={onSave} />
      )}
    </FormProvider>
  );
}

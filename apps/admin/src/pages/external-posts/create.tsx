import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  describeCreateExternalPostError,
  ExternalPostCreateForm,
  useCreateExternalPost,
} from '@domains/external-posts';
import { ROUTES } from '@shared/lib/routes';

export function ExternalPostsCreatePage() {
  const navigate = useNavigate();
  const mutation = useCreateExternalPost();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">새 외부 글 등록</h1>
      <ExternalPostCreateForm
        disabled={mutation.isPending}
        onCancel={() => navigate(ROUTES.externalPosts)}
        onSubmit={(dto) => {
          mutation.mutate(dto, {
            onSuccess: (post) => {
              toast.success('등록되었습니다.');
              navigate(ROUTES.externalPostEdit(post.id));
            },
            onError: (err) => toast.error(describeCreateExternalPostError(err)),
          });
        }}
      />
    </div>
  );
}

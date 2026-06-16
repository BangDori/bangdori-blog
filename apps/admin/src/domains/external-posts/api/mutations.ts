import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateExternalPostDto, UpdateExternalPostDto } from '../model/schema';
import type { ExternalPost } from '../model/types';
import { createExternalPost, deleteExternalPost, updateExternalPost } from './index';
import { externalPostsKeys } from './keys';

export function useCreateExternalPost() {
  const qc = useQueryClient();

  return useMutation<ExternalPost, Error, CreateExternalPostDto>({
    mutationFn: (dto) => createExternalPost(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: externalPostsKeys.lists() });
    },
  });
}

export function useUpdateExternalPost(id: string) {
  const qc = useQueryClient();

  return useMutation<ExternalPost, Error, UpdateExternalPostDto>({
    mutationFn: (dto) => updateExternalPost(id, dto),
    onSuccess: (next) => {
      qc.setQueryData(externalPostsKeys.detail(id), next);
      qc.invalidateQueries({ queryKey: externalPostsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: externalPostsKeys.lists() });
    },
  });
}

export function useDeleteExternalPost(id: string) {
  const qc = useQueryClient();

  return useMutation<void, Error, void>({
    mutationKey: externalPostsKeys.deleteMutation(id),
    mutationFn: () => deleteExternalPost(id),
    onSuccess: () => {
      qc.removeQueries({ queryKey: externalPostsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: externalPostsKeys.lists() });
    },
  });
}

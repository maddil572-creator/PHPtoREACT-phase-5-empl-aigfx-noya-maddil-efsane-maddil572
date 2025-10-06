import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, MediaFile, MediaUploadData, MediaUpdateData } from '../utils/api';

export function useMediaLibrary(page: number = 1, limit: number = 20, type?: string) {
  return useQuery({
    queryKey: ['admin', 'media', page, limit, type],
    queryFn: async () => {
      const response = await adminApi.media.getAll(page, limit, type);
      return response;
    },
    staleTime: 30000,
  });
}

export function useMediaFile(id: number | null) {
  return useQuery({
    queryKey: ['admin', 'media', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await adminApi.media.getById(id);
      return response.data?.file || null;
    },
    enabled: !!id,
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MediaUploadData) => {
      return await adminApi.media.upload(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
    },
  });
}

export function useUpdateMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: MediaUpdateData }) => {
      return await adminApi.media.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'media', variables.id] });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await adminApi.media.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
    },
  });
}

export function useBulkUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: MediaUploadData[]) => {
      const uploads = files.map(file => adminApi.media.upload(file));
      return await Promise.all(uploads);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
    },
  });
}

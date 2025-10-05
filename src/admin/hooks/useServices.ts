/**
 * React Query hooks for Service Management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, Service, ServiceFormData } from '../utils/api';

export function useServices() {
  return useQuery({
    queryKey: ['admin', 'services'],
    queryFn: async () => {
      const response = await adminApi.services.getAll();
      return Array.isArray(response) ? response : response.data || [];
    },
    staleTime: 30000,
  });
}

export function useService(id: number | null) {
  return useQuery({
    queryKey: ['admin', 'services', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await adminApi.services.getById(id);
      return response.data || response || null;
    },
    enabled: !!id,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ServiceFormData) => {
      return await adminApi.services.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ServiceFormData }) => {
      return await adminApi.services.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'services', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await adminApi.services.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

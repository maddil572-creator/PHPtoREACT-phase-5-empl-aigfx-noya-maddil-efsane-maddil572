/**
 * FAQ Management Hooks
 * React Query hooks for FAQ CRUD operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, FAQ } from '../utils/api';

// Get all FAQs
export const useFAQs = () => {
  return useQuery({
    queryKey: ['admin', 'faqs'],
    queryFn: () => adminApi.faqs.getAll(),
  });
};

// Get single FAQ by ID
export const useFAQ = (id: number) => {
  return useQuery({
    queryKey: ['admin', 'faqs', id],
    queryFn: () => adminApi.faqs.getById(id),
    enabled: !!id,
  });
};

// Create new FAQ
export const useCreateFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>) =>
      adminApi.faqs.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
    },
  });
};

// Update existing FAQ
export const useUpdateFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: Partial<FAQ> & { id: number }) =>
      adminApi.faqs.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs', variables.id] });
    },
  });
};

// Delete FAQ
export const useDeleteFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminApi.faqs.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
    },
  });
};

// Bulk operations
export const useBulkUpdateFAQs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Array<{ id: number; order?: number; status?: string }>) =>
      adminApi.faqs.bulkUpdate(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
    },
  });
};
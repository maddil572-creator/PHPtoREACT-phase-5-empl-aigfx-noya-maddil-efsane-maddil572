/**
 * React Query hooks for Testimonials Management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, Testimonial, TestimonialFormData } from '../utils/api';

export function useTestimonials() {
  return useQuery({
    queryKey: ['admin', 'testimonials'],
    queryFn: async () => {
      const response = await adminApi.testimonials.getAll();
      return Array.isArray(response) ? response : response.data || [];
    },
    staleTime: 30000,
  });
}

export function useTestimonial(id: number | null) {
  return useQuery({
    queryKey: ['admin', 'testimonials', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await adminApi.testimonials.getById(id);
      return response.data || response || null;
    },
    enabled: !!id,
  });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TestimonialFormData) => {
      return await adminApi.testimonials.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useUpdateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TestimonialFormData }) => {
      return await adminApi.testimonials.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await adminApi.testimonials.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

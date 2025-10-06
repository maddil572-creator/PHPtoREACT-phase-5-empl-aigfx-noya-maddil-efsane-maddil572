/**
 * React Query hooks for Portfolio Management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, Portfolio, PortfolioFormData } from '../utils/api';

export function usePortfolios() {
  return useQuery({
    queryKey: ['admin', 'portfolio'],
    queryFn: async () => {
      const response = await adminApi.portfolio.getAll();
      return Array.isArray(response) ? response : response.data || [];
    },
    staleTime: 30000,
  });
}

export function usePortfolio(id: number | null) {
  return useQuery({
    queryKey: ['admin', 'portfolio', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await adminApi.portfolio.getById(id);
      return response.data || response || null;
    },
    enabled: !!id,
  });
}

export function useCreatePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PortfolioFormData) => {
      return await adminApi.portfolio.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useUpdatePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PortfolioFormData }) => {
      return await adminApi.portfolio.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'portfolio', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useDeletePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await adminApi.portfolio.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

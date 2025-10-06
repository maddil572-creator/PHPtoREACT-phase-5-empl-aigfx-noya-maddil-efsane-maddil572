import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, auditLogService } from '../services/notificationService';
import type { Notification, AuditLog } from '../services/notificationService';

export function useNotifications(params?: {
  page?: number;
  limit?: number;
  type?: string;
  read?: boolean;
}) {
  return useQuery({
    queryKey: ['admin', 'notifications', params],
    queryFn: () => notificationService.getAll(params),
    staleTime: 30000,
  });
}

export function useUnreadCount(refetchInterval?: number) {
  return useQuery({
    queryKey: ['admin', 'notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 10000,
    refetchInterval: refetchInterval,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });
}

export function useDeleteAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });
}

export function useAuditLogs(params?: {
  page?: number;
  limit?: number;
  userId?: number;
  action?: string;
  entity?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: () => auditLogService.getAll(params),
    staleTime: 60000,
  });
}

export function useAuditLogById(id: number) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', id],
    queryFn: () => auditLogService.getById(id),
    enabled: !!id,
  });
}

export function useExportAuditLogs() {
  return useMutation({
    mutationFn: (params?: {
      startDate?: string;
      endDate?: string;
      format?: 'csv' | 'json';
    }) => auditLogService.export(params),
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${variables?.format || 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}

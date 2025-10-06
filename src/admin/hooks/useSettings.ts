import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, SettingsFormData, ProfileFormData } from '../utils/api';

export function useSettings() {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const response = await adminApi.settings.getAll();
      return Array.isArray(response) ? response : response.data || [];
    },
    staleTime: 60000,
  });
}

export function useSettingsByCategory(category: string) {
  return useQuery({
    queryKey: ['admin', 'settings', 'category', category],
    queryFn: async () => {
      const response = await adminApi.settings.getByCategory(category);
      return Array.isArray(response) ? response : response.data || [];
    },
    enabled: !!category,
    staleTime: 60000,
  });
}

export function useSetting(key: string | null) {
  return useQuery({
    queryKey: ['admin', 'settings', key],
    queryFn: async () => {
      if (!key) return null;
      const response = await adminApi.settings.get(key);
      return response.value || null;
    },
    enabled: !!key,
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value, type }: { key: string; value: string; type?: string }) => {
      return await adminApi.settings.update(key, value, type);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
  });
}

export function useBulkUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Record<string, any>) => {
      return await adminApi.settings.bulkUpdate(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
  });
}

export function useUploadSettingsFile() {
  return useMutation({
    mutationFn: async (file: File) => {
      return await adminApi.settings.uploadFile(file);
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ['admin', 'profile'],
    queryFn: async () => {
      const response = await adminApi.profile.get();
      return response.data || response;
    },
    staleTime: 300000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return await adminApi.profile.update(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'profile'] });
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      return await adminApi.profile.updatePassword(currentPassword, newPassword);
    },
  });
}

export function useUploadProfileAvatar() {
  return useMutation({
    mutationFn: async (file: File) => {
      return await adminApi.profile.uploadAvatar(file);
    },
  });
}

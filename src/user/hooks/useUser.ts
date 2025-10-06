import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../services/userService';

export function useUserProfile() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['userProfile'],
    queryFn: () => userService.getProfile(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateProfile() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name?: string; avatar?: string }) =>
      userService.updateProfile(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}

export function useChangePassword() {
  const { token } = useAuth();

  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      userService.changePassword(token!, data),
  });
}

export function useDailyCheckIn() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userService.checkInDaily(token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}

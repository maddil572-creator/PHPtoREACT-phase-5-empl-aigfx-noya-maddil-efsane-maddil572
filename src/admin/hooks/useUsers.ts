import { useState, useEffect } from 'react';
import type { AdminUser, UserListResponse, Role } from '@/user/types';
import { adminApi } from '@/admin/utils/api';

interface UseUsersOptions {
  search?: string;
  role?: Role | '';
  page?: number;
  limit?: number;
}

export function useUsers(options: UseUsersOptions = {}) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.search) params.append('search', options.search);
      if (options.role) params.append('role', options.role);
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());

      const response = await adminApi.get(`/admin/users?${params.toString()}`);
      const data: UserListResponse = response.data;

      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [options.search, options.role, options.page, options.limit]);

  const updateUserRole = async (userId: string, newRole: Role) => {
    try {
      await adminApi.put(`/admin/users/${userId}/role`, { role: newRole });
      await fetchUsers();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update role',
      };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await adminApi.delete(`/admin/users/${userId}`);
      await fetchUsers();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to delete user',
      };
    }
  };

  return {
    users,
    pagination,
    loading,
    error,
    refetch: fetchUsers,
    updateUserRole,
    deleteUser,
  };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/backend';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

function getAuthToken(): string {
  return localStorage.getItem('admin_token') || '';
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
    throw new Error('Unauthorized');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
}

export interface Notification {
  id: number;
  type: 'system' | 'user' | 'security' | 'content' | 'info';
  title: string;
  message: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  readAt?: string;
}

export interface AuditLog {
  id: number;
  userId: number;
  userName?: string;
  action: string;
  entity: string;
  entityId?: number;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  status: 'success' | 'failed';
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unread: number;
  page: number;
  limit: number;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

export const notificationService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    read?: boolean;
  }): Promise<NotificationsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.type) searchParams.append('type', params.type);
    if (params?.read !== undefined) searchParams.append('read', params.read.toString());

    const query = searchParams.toString();
    return request<NotificationsResponse>(
      `/api/admin/notifications.php${query ? `?${query}` : ''}`
    );
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    return request<{ count: number }>('/api/admin/notifications.php?unread_count=true');
  },

  markAsRead: async (id: number): Promise<ApiResponse> => {
    return request<ApiResponse>(`/api/admin/notifications.php/${id}/read`, {
      method: 'PUT',
    });
  },

  markAllAsRead: async (): Promise<ApiResponse> => {
    return request<ApiResponse>('/api/admin/notifications.php/mark-all-read', {
      method: 'PUT',
    });
  },

  delete: async (id: number): Promise<ApiResponse> => {
    return request<ApiResponse>(`/api/admin/notifications.php/${id}`, {
      method: 'DELETE',
    });
  },

  deleteAll: async (): Promise<ApiResponse> => {
    return request<ApiResponse>('/api/admin/notifications.php/delete-all', {
      method: 'DELETE',
    });
  },
};

export const auditLogService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    userId?: number;
    action?: string;
    entity?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AuditLogsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.userId) searchParams.append('userId', params.userId.toString());
    if (params?.action) searchParams.append('action', params.action);
    if (params?.entity) searchParams.append('entity', params.entity);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);

    const query = searchParams.toString();
    return request<AuditLogsResponse>(
      `/api/admin/audit.php${query ? `?${query}` : ''}`
    );
  },

  getById: async (id: number): Promise<{ log: AuditLog }> => {
    return request<{ log: AuditLog }>(`/api/admin/audit.php/${id}`);
  },

  export: async (params?: {
    startDate?: string;
    endDate?: string;
    format?: 'csv' | 'json';
  }): Promise<Blob> => {
    const token = getAuthToken();
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.format) searchParams.append('format', params.format);

    const query = searchParams.toString();
    const response = await fetch(
      `${API_BASE_URL}/api/admin/audit.php/export${query ? `?${query}` : ''}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  },
};

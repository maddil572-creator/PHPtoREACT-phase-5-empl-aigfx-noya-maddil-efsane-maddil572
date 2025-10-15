/**
 * API Client Utility
 * Centralized HTTP client with authentication and error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/backend';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string {
  return localStorage.getItem('authToken') || localStorage.getItem('admin_token') || '';
}

/**
 * Make authenticated API request
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  // Ensure endpoint starts with /
  if (!endpoint.startsWith('/')) {
    endpoint = '/' + endpoint;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle authentication errors
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('admin_token');
      
      // Redirect to login if on admin page
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
      
      throw new ApiError('Unauthorized', 401);
    }

    // Try to parse JSON response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      throw new ApiError(
        data.error || data.message || `HTTP ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

/**
 * Convenience methods for different HTTP verbs
 */
export const api = {
  get: <T = any>(endpoint: string, params?: Record<string, any>) => {
    const url = params 
      ? `${endpoint}?${new URLSearchParams(params).toString()}`
      : endpoint;
    return apiRequest<T>(url);
  },

  post: <T = any>(endpoint: string, data?: any) => {
    return apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put: <T = any>(endpoint: string, data?: any) => {
    return apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  patch: <T = any>(endpoint: string, data?: any) => {
    return apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete: <T = any>(endpoint: string) => {
    return apiRequest<T>(endpoint, {
      method: 'DELETE',
    });
  },

  upload: async <T = any>(endpoint: string, file: File, additionalData?: Record<string, string>) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('admin_token');
      throw new ApiError('Unauthorized', 401);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || data.message || 'Upload failed',
        response.status,
        data
      );
    }

    return data as T;
  },
};

/**
 * Test API connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    await api.get('/');
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
}

/**
 * Get API configuration
 */
export const getApiConfig = () => ({
  baseUrl: API_BASE_URL,
  isConnected: false, // Will be updated by connection test
});
/**
 * Admin API Service Layer
 * Handles all admin-specific API calls with authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/backend';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class AdminApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
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

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
      throw new AdminApiError('Unauthorized', 401);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new AdminApiError(
        data.error || data.message || 'Request failed',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof AdminApiError) {
      throw error;
    }
    throw new AdminApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author_id: number;
  author?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  featured_image: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  status: 'draft' | 'published' | 'archived';
  views: number;
  likes: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  featured_image: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  status: 'draft' | 'published' | 'archived';
}

export interface PricingTier {
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  icon: string;
  tagline: string;
  description: string;
  features: string[];
  pricingTiers: PricingTier[];
  deliveryTime: string;
  popular: boolean;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  testimonialIds?: number[];
}

export interface ServiceFormData {
  name: string;
  tagline: string;
  description: string;
  icon: string;
  features: string[];
  pricingTiers: PricingTier[];
  deliveryTime: string;
  popular: boolean;
  active: boolean;
}

export interface Portfolio {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  longDescription?: string;
  client?: string;
  completionDate?: string;
  featuredImage: string;
  images: string[];
  beforeImage?: string;
  afterImage?: string;
  tags: string[];
  technologies?: string[];
  projectUrl?: string;
  results?: {
    metric1?: string;
    metric2?: string;
    metric3?: string;
  };
  featured: boolean;
  status: 'active' | 'archived' | 'draft';
  views: number;
  created_at?: string;
  updated_at?: string;
}

export interface PortfolioFormData {
  title: string;
  category: string;
  description: string;
  longDescription?: string;
  client?: string;
  completionDate?: string;
  featuredImage: string;
  images: string[];
  tags: string[];
  technologies?: string[];
  projectUrl?: string;
  featured: boolean;
  status: 'active' | 'archived' | 'draft';
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company?: string;
  content: string;
  rating: number;
  avatar?: string;
  featured: boolean;
  status: 'active' | 'archived' | 'pending';
  created_at?: string;
  updated_at?: string;
}

export interface TestimonialFormData {
  name: string;
  role: string;
  company?: string;
  content: string;
  rating: number;
  avatar?: string;
  featured: boolean;
  status: 'active' | 'archived' | 'pending';
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  type: 'text' | 'number' | 'boolean' | 'json' | 'url' | 'email' | 'color';
  category: 'general' | 'seo' | 'appearance' | 'social' | 'api';
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SettingsFormData {
  site_name?: string;
  site_tagline?: string;
  contact_email?: string;
  contact_phone?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  dark_mode_enabled?: boolean;
}

export interface ProfileFormData {
  name: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  avatar?: string;
}

export interface AdminProfile {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  created_at: string;
}

export interface DashboardStats {
  total_users: number;
  total_blogs: number;
  total_contacts: number;
  total_tokens: number;
  new_users_month: number;
  popular_blogs: Array<{ id: number; title: string; views: number }>;
}

export interface ActivityItem {
  id: number;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

export const adminApi = {
  auth: {
    login: async (email: string, password: string) => {
      return request<ApiResponse<{ token: string; user: any }>>('/api/auth.php/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    verify: async () => {
      return request<ApiResponse<{ user: any }>>('/api/auth.php/verify');
    },

    logout: () => {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    },
  },

  stats: {
    getDashboard: async () => {
      return request<ApiResponse<DashboardStats>>('/api/admin/stats.php');
    },
  },

  activity: {
    getRecent: async (limit: number = 10) => {
      return request<ApiResponse<{ activities: ActivityItem[] }>>(
        `/api/admin/activity.php?limit=${limit}`
      );
    },
  },

  blogs: {
    getAll: async () => {
      return request<ApiResponse<{ blogs: Blog[] }>>('/api/admin/blogs.php');
    },

    getById: async (id: number) => {
      return request<ApiResponse<{ blog: Blog }>>(`/api/blogs.php/${id}`);
    },

    create: async (data: BlogFormData) => {
      return request<ApiResponse<{ id: number }>>('/api/admin/blogs.php', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: BlogFormData) => {
      return request<ApiResponse>(`/api/admin/blogs.php/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number) => {
      return request<ApiResponse>(`/api/admin/blogs.php/${id}`, {
        method: 'DELETE',
      });
    },

    uploadImage: async (file: File) => {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/uploads.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new AdminApiError(error.error || 'Upload failed', response.status);
      }

      return response.json();
    },
  },

  services: {
    getAll: async () => {
      return request<ApiResponse<Service[]>>('/api/services.php');
    },

    getById: async (id: number) => {
      return request<ApiResponse<Service>>(`/api/services.php/${id}`);
    },

    create: async (data: ServiceFormData) => {
      return request<ApiResponse<{ id: number }>>('/api/services.php', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: ServiceFormData) => {
      return request<ApiResponse>(`/api/services.php/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number) => {
      return request<ApiResponse>(`/api/services.php/${id}`, {
        method: 'DELETE',
      });
    },
  },

  portfolio: {
    getAll: async () => {
      return request<ApiResponse<Portfolio[]>>('/api/portfolio.php');
    },

    getById: async (id: number) => {
      return request<ApiResponse<Portfolio>>(`/api/portfolio.php/${id}`);
    },

    create: async (data: PortfolioFormData) => {
      return request<ApiResponse<{ id: number }>>('/api/portfolio.php', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: PortfolioFormData) => {
      return request<ApiResponse>(`/api/portfolio.php/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number) => {
      return request<ApiResponse>(`/api/portfolio.php/${id}`, {
        method: 'DELETE',
      });
    },

    uploadImage: async (file: File) => {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/uploads.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new AdminApiError(error.error || 'Upload failed', response.status);
      }

      return response.json();
    },
  },

  testimonials: {
    getAll: async () => {
      return request<ApiResponse<Testimonial[]>>('/api/testimonials.php');
    },

    getById: async (id: number) => {
      return request<ApiResponse<Testimonial>>(`/api/testimonials.php/${id}`);
    },

    create: async (data: TestimonialFormData) => {
      return request<ApiResponse<{ id: number }>>('/api/testimonials.php', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: TestimonialFormData) => {
      return request<ApiResponse>(`/api/testimonials.php/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number) => {
      return request<ApiResponse>(`/api/testimonials.php/${id}`, {
        method: 'DELETE',
      });
    },

    uploadAvatar: async (file: File) => {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/uploads.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new AdminApiError(error.error || 'Upload failed', response.status);
      }

      return response.json();
    },
  },

  settings: {
    getAll: async () => {
      return request<ApiResponse<Setting[]>>('/api/settings.php');
    },

    getByCategory: async (category: string) => {
      return request<ApiResponse<Setting[]>>(`/api/settings.php/category/${category}`);
    },

    get: async (key: string) => {
      return request<ApiResponse<{ value: string }>>(`/api/settings.php/${key}`);
    },

    update: async (key: string, value: string, type: string = 'text') => {
      return request<ApiResponse>(`/api/settings.php/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value, type }),
      });
    },

    bulkUpdate: async (settings: Record<string, any>) => {
      return request<ApiResponse>('/api/settings.php/bulk', {
        method: 'PUT',
        body: JSON.stringify({ settings }),
      });
    },

    uploadFile: async (file: File) => {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/uploads.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new AdminApiError(error.error || 'Upload failed', response.status);
      }

      return response.json();
    },
  },

  profile: {
    get: async () => {
      return request<ApiResponse<AdminProfile>>('/api/user/profile.php');
    },

    update: async (data: ProfileFormData) => {
      return request<ApiResponse>('/api/user/profile.php', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    updatePassword: async (currentPassword: string, newPassword: string) => {
      return request<ApiResponse>('/api/user/profile.php/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    },

    uploadAvatar: async (file: File) => {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/uploads.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new AdminApiError(error.error || 'Upload failed', response.status);
      }

      return response.json();
    },
  },
};

export { AdminApiError };

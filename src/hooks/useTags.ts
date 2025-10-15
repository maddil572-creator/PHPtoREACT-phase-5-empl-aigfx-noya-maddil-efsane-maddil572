import { useState, useEffect } from 'react';

export interface Tag {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  category: 'service' | 'skill' | 'industry' | 'technology' | 'style' | 'general';
  usage_count?: number;
  is_featured?: boolean;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  service_count?: number;
  services?: string[];
}

export function useTags(options: { 
  admin?: boolean; 
  category?: string; 
  status?: string;
  featured?: boolean;
  search?: string;
  sort?: 'name' | 'usage' | 'created' | 'updated';
  order?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
} = {}) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.admin) params.append('admin', '1');
      if (options.category) params.append('category', options.category);
      if (options.status) params.append('status', options.status);
      if (options.featured) params.append('featured', '1');
      if (options.search) params.append('search', options.search);
      if (options.sort) params.append('sort', options.sort);
      if (options.order) params.append('order', options.order);
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (options.admin) {
        const token = localStorage.getItem('token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`/api/tags.php?${params.toString()}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setTags(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch tags');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching tags:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [
    options.admin, 
    options.category, 
    options.status, 
    options.featured, 
    options.search, 
    options.sort, 
    options.order, 
    options.limit, 
    options.offset
  ]);

  return { tags, loading, error, refetch: fetchTags };
}

export function useTag(id?: number) {
  const [tag, setTag] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTag = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add auth header if we have a token (for admin access)
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/tags.php/${id}`, { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setTag(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch tag');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching tag:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTag();
  }, [id]);

  return { tag, loading, error, refetch: fetchTag };
}

export function useTagMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const createTag = async (tagData: Partial<Tag>): Promise<{ id: number }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/tags.php', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(tagData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to create tag');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTag = async (id: number, tagData: Partial<Tag>): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tags.php/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(tagData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update tag');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTag = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tags.php/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete tag');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTag,
    updateTag,
    deleteTag,
    loading,
    error,
  };
}

// Hook for tag categories and filtering
export function useTagCategories() {
  const categories = [
    { value: 'service', label: 'Services', color: '#3B82F6', description: 'Service-related tags' },
    { value: 'skill', label: 'Skills', color: '#10B981', description: 'Technical skills and expertise' },
    { value: 'industry', label: 'Industries', color: '#F59E0B', description: 'Industry-specific tags' },
    { value: 'technology', label: 'Technologies', color: '#8B5CF6', description: 'Software and tools' },
    { value: 'style', label: 'Styles', color: '#EF4444', description: 'Design styles and approaches' },
    { value: 'general', label: 'General', color: '#6B7280', description: 'General purpose tags' },
  ];

  return { categories };
}
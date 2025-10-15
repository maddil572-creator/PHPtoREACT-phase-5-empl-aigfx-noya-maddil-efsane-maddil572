import { useState, useEffect } from 'react';

export interface PageSection {
  id?: number;
  type: 'hero' | 'text' | 'image' | 'gallery' | 'cta' | 'testimonials' | 'services' | 'contact_form' | 'custom_html';
  title?: string;
  content?: string;
  data?: any;
  display_order?: number;
  is_active?: boolean;
}

export interface Page {
  id?: number;
  title: string;
  slug: string;
  content?: string;
  meta_description?: string;
  meta_keywords?: string;
  status: 'draft' | 'published' | 'archived';
  template: 'default' | 'landing' | 'service' | 'portfolio' | 'blog';
  show_in_navigation: boolean;
  navigation_order: number;
  parent_page_id?: number;
  featured_image?: string;
  custom_css?: string;
  custom_js?: string;
  seo_title?: string;
  canonical_url?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  created_by_name?: string;
  sections?: PageSection[];
  sections_count?: number;
}

export function usePages(options: { 
  admin?: boolean; 
  navigation?: boolean; 
  status?: string; 
  template?: string; 
  limit?: number 
} = {}) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.admin) params.append('admin', '1');
      if (options.navigation) params.append('navigation', '1');
      if (options.status) params.append('status', options.status);
      if (options.template) params.append('template', options.template);
      if (options.limit) params.append('limit', options.limit.toString());

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (options.admin) {
        const token = localStorage.getItem('token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`/api/pages.php?${params.toString()}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setPages(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch pages');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching pages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [options.admin, options.navigation, options.status, options.template, options.limit]);

  return { pages, loading, error, refetch: fetchPages };
}

export function usePage(id?: number, slug?: string) {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = async () => {
    if (!id && !slug) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const endpoint = id ? `/api/pages.php/${id}` : `/api/pages.php/${slug}`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add auth header if we have a token (for admin access)
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setPage(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch page');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching page:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage();
  }, [id, slug]);

  return { page, loading, error, refetch: fetchPage };
}

export function usePageMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const createPage = async (pageData: Partial<Page>): Promise<{ id: number }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/pages.php', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(pageData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to create page');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePage = async (id: number, pageData: Partial<Page>): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/pages.php/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(pageData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update page');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePage = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/pages.php/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete page');
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
    createPage,
    updatePage,
    deletePage,
    loading,
    error,
  };
}
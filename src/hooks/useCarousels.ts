import { useState, useEffect } from 'react';

export interface CarouselSlide {
  id?: number;
  title?: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  video_url?: string;
  link_url?: string;
  link_text?: string;
  link_target?: '_self' | '_blank';
  background_color?: string;
  text_color?: string;
  button_style?: 'primary' | 'secondary' | 'outline' | 'ghost';
  display_order?: number;
  is_active?: boolean;
  custom_css?: string;
  custom_data?: any;
}

export interface ResponsiveBreakpoint {
  breakpoint: number;
  slides_to_show: number;
  slides_to_scroll: number;
}

export interface Carousel {
  id?: number;
  name: string;
  slug: string;
  type: 'hero' | 'testimonials' | 'portfolio' | 'products' | 'images' | 'custom';
  autoplay: boolean;
  autoplay_speed: number;
  show_dots: boolean;
  show_arrows: boolean;
  infinite_loop: boolean;
  slides_to_show: number;
  slides_to_scroll: number;
  responsive_breakpoints?: ResponsiveBreakpoint[];
  animation_type: 'slide' | 'fade' | 'zoom' | 'flip';
  animation_speed: number;
  pause_on_hover: boolean;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  created_by_name?: string;
  slides?: CarouselSlide[];
  slides_count?: number;
}

export function useCarousels(options: { 
  admin?: boolean; 
  type?: string; 
  slug?: string; 
  limit?: number 
} = {}) {
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCarousels = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.admin) params.append('admin', '1');
      if (options.type) params.append('type', options.type);
      if (options.slug) params.append('slug', options.slug);
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

      const response = await fetch(`/api/carousels.php?${params.toString()}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCarousels(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch carousels');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching carousels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarousels();
  }, [options.admin, options.type, options.slug, options.limit]);

  return { carousels, loading, error, refetch: fetchCarousels };
}

export function useCarousel(id?: number, slug?: string) {
  const [carousel, setCarousel] = useState<Carousel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCarousel = async () => {
    if (!id && !slug) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const endpoint = id ? `/api/carousels.php/${id}` : `/api/carousels.php?slug=${slug}`;
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
        setCarousel(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch carousel');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching carousel:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarousel();
  }, [id, slug]);

  return { carousel, loading, error, refetch: fetchCarousel };
}

export function useCarouselMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const createCarousel = async (carouselData: Partial<Carousel>): Promise<{ id: number }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/carousels.php', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(carouselData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to create carousel');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCarousel = async (id: number, carouselData: Partial<Carousel>): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/carousels.php/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(carouselData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update carousel');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCarousel = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/carousels.php/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete carousel');
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
    createCarousel,
    updateCarousel,
    deleteCarousel,
    loading,
    error,
  };
}
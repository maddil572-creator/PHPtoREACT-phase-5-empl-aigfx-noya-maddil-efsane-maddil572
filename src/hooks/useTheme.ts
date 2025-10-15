import { useState, useEffect } from 'react';

export interface ThemeConfig {
  // Brand Colors
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  success_color: string;
  warning_color: string;
  error_color: string;
  
  // Background Colors
  background_primary: string;
  background_secondary: string;
  background_muted: string;
  
  // Text Colors
  text_primary: string;
  text_secondary: string;
  text_muted: string;
  
  // Border Colors
  border_color: string;
  border_muted: string;
  
  // Component Specific
  button_primary_bg: string;
  button_primary_text: string;
  button_secondary_bg: string;
  button_secondary_text: string;
  
  // Layout
  header_bg: string;
  footer_bg: string;
  sidebar_bg: string;
  
  // Advanced
  gradient_start: string;
  gradient_end: string;
  shadow_color: string;
  
  // Typography
  font_primary: string;
  font_secondary: string;
  font_size_base: string;
  line_height_base: string;
  
  // Spacing
  border_radius: string;
  spacing_unit: string;
  
  // Dark Mode
  dark_mode_enabled: boolean;
  dark_primary_color: string;
  dark_background: string;
  dark_text_color: string;
}

const DEFAULT_THEME: ThemeConfig = {
  // Brand Colors
  primary_color: '#3B82F6',
  secondary_color: '#10B981',
  accent_color: '#F59E0B',
  success_color: '#10B981',
  warning_color: '#F59E0B',
  error_color: '#EF4444',
  
  // Background Colors
  background_primary: '#FFFFFF',
  background_secondary: '#F8FAFC',
  background_muted: '#F1F5F9',
  
  // Text Colors
  text_primary: '#1E293B',
  text_secondary: '#475569',
  text_muted: '#64748B',
  
  // Border Colors
  border_color: '#E2E8F0',
  border_muted: '#F1F5F9',
  
  // Component Specific
  button_primary_bg: '#3B82F6',
  button_primary_text: '#FFFFFF',
  button_secondary_bg: '#F1F5F9',
  button_secondary_text: '#475569',
  
  // Layout
  header_bg: '#FFFFFF',
  footer_bg: '#1E293B',
  sidebar_bg: '#F8FAFC',
  
  // Advanced
  gradient_start: '#3B82F6',
  gradient_end: '#10B981',
  shadow_color: '#00000010',
  
  // Typography
  font_primary: 'Inter, sans-serif',
  font_secondary: 'Inter, sans-serif',
  font_size_base: '16px',
  line_height_base: '1.5',
  
  // Spacing
  border_radius: '8px',
  spacing_unit: '4px',
  
  // Dark Mode
  dark_mode_enabled: false,
  dark_primary_color: '#60A5FA',
  dark_background: '#0F172A',
  dark_text_color: '#F1F5F9',
};

export function useTheme() {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/settings.php?category=theme');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const themeSettings: any = {};
        data.data.forEach((setting: any) => {
          themeSettings[setting.key] = setting.value;
        });
        
        setTheme(prev => ({ ...prev, ...themeSettings }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching theme:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTheme = async (updates: Partial<ThemeConfig>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: 'theme',
          settings: updates,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setTheme(prev => ({ ...prev, ...updates }));
        applyThemeToDOM({ ...theme, ...updates });
        return true;
      } else {
        throw new Error(data.error || 'Failed to update theme');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const applyThemeToDOM = (themeConfig: ThemeConfig) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(themeConfig).forEach(([key, value]) => {
      if (typeof value === 'string' && value.startsWith('#')) {
        // Convert hex colors to RGB for CSS variables
        const hex = value.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        root.style.setProperty(`--${key.replace(/_/g, '-')}`, `${r} ${g} ${b}`);
        root.style.setProperty(`--${key.replace(/_/g, '-')}-hex`, value);
      } else {
        root.style.setProperty(`--${key.replace(/_/g, '-')}`, String(value));
      }
    });
    
    // Apply dark mode class
    if (themeConfig.dark_mode_enabled) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const resetTheme = async () => {
    try {
      await updateTheme(DEFAULT_THEME);
    } catch (err) {
      console.error('Error resetting theme:', err);
    }
  };

  const exportTheme = () => {
    return JSON.stringify(theme, null, 2);
  };

  const importTheme = async (themeJson: string) => {
    try {
      const importedTheme = JSON.parse(themeJson);
      await updateTheme(importedTheme);
    } catch (err) {
      throw new Error('Invalid theme format');
    }
  };

  // Apply theme on load
  useEffect(() => {
    if (!loading) {
      applyThemeToDOM(theme);
    }
  }, [theme, loading]);

  return {
    theme,
    loading,
    error,
    updateTheme,
    resetTheme,
    exportTheme,
    importTheme,
    refetch: fetchTheme,
  };
}

// Predefined theme presets
export const THEME_PRESETS = {
  default: {
    name: 'Default Blue',
    theme: DEFAULT_THEME,
  },
  green: {
    name: 'Nature Green',
    theme: {
      ...DEFAULT_THEME,
      primary_color: '#10B981',
      secondary_color: '#059669',
      accent_color: '#34D399',
      gradient_start: '#10B981',
      gradient_end: '#059669',
    },
  },
  purple: {
    name: 'Royal Purple',
    theme: {
      ...DEFAULT_THEME,
      primary_color: '#8B5CF6',
      secondary_color: '#7C3AED',
      accent_color: '#A78BFA',
      gradient_start: '#8B5CF6',
      gradient_end: '#7C3AED',
    },
  },
  orange: {
    name: 'Sunset Orange',
    theme: {
      ...DEFAULT_THEME,
      primary_color: '#F97316',
      secondary_color: '#EA580C',
      accent_color: '#FB923C',
      gradient_start: '#F97316',
      gradient_end: '#EA580C',
    },
  },
  dark: {
    name: 'Dark Mode',
    theme: {
      ...DEFAULT_THEME,
      dark_mode_enabled: true,
      background_primary: '#0F172A',
      background_secondary: '#1E293B',
      background_muted: '#334155',
      text_primary: '#F1F5F9',
      text_secondary: '#CBD5E1',
      text_muted: '#94A3B8',
      header_bg: '#1E293B',
      footer_bg: '#0F172A',
      sidebar_bg: '#1E293B',
    },
  },
  minimal: {
    name: 'Minimal Gray',
    theme: {
      ...DEFAULT_THEME,
      primary_color: '#374151',
      secondary_color: '#6B7280',
      accent_color: '#9CA3AF',
      gradient_start: '#374151',
      gradient_end: '#6B7280',
      border_radius: '4px',
    },
  },
};
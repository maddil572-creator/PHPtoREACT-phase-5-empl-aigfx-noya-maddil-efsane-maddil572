import { useEffect } from 'react';
import { useGlobalSettings } from '@/components/global-settings-provider';

export function DynamicTheme() {
  const { settings } = useGlobalSettings();

  useEffect(() => {
    if (settings?.appearance) {
      const root = document.documentElement;
      
      // Apply primary color
      if (settings.appearance.primary_color) {
        const primaryColor = settings.appearance.primary_color;
        root.style.setProperty('--primary', primaryColor);
        
        // Generate lighter/darker variants
        const rgb = hexToRgb(primaryColor);
        if (rgb) {
          root.style.setProperty('--primary-foreground', getContrastColor(primaryColor));
          root.style.setProperty('--primary-50', `rgb(${Math.min(255, rgb.r + 50)}, ${Math.min(255, rgb.g + 50)}, ${Math.min(255, rgb.b + 50)})`);
          root.style.setProperty('--primary-100', `rgb(${Math.min(255, rgb.r + 30)}, ${Math.min(255, rgb.g + 30)}, ${Math.min(255, rgb.b + 30)})`);
          root.style.setProperty('--primary-200', `rgb(${Math.max(0, rgb.r - 30)}, ${Math.max(0, rgb.g - 30)}, ${Math.max(0, rgb.b - 30)})`);
        }
      }
      
      // Apply secondary color
      if (settings.appearance.secondary_color) {
        const secondaryColor = settings.appearance.secondary_color;
        root.style.setProperty('--secondary', secondaryColor);
        root.style.setProperty('--secondary-foreground', getContrastColor(secondaryColor));
      }
      
      // Apply accent colors for YouTube branding
      if (settings.appearance.primary_color) {
        root.style.setProperty('--youtube-red', settings.appearance.primary_color);
      }
      
      // Apply custom CSS if provided
      if (settings.appearance.custom_css) {
        const styleElement = document.getElementById('dynamic-theme-css') || document.createElement('style');
        styleElement.id = 'dynamic-theme-css';
        styleElement.textContent = settings.appearance.custom_css;
        
        if (!document.getElementById('dynamic-theme-css')) {
          document.head.appendChild(styleElement);
        }
      }
    }
  }, [settings?.appearance]);

  return null;
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getContrastColor(hexColor: string) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#000000';
  
  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
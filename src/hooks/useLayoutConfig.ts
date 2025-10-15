import { useState, useEffect } from 'react';

export interface HeaderConfig {
  show_header: boolean;
  header_style: 'modern' | 'classic' | 'minimal';
  header_background: 'transparent' | 'solid' | 'gradient';
  header_position: 'sticky' | 'fixed' | 'static';
  show_search: boolean;
  show_language_switcher: boolean;
  show_theme_toggle: boolean;
  header_height: number;
  mobile_menu_style: 'slide' | 'dropdown' | 'fullscreen';
}

export interface FooterConfig {
  show_footer: boolean;
  footer_style: 'modern' | 'classic' | 'minimal';
  footer_columns: number;
  show_newsletter: boolean;
  show_social_links: boolean;
  show_back_to_top: boolean;
  footer_background: 'dark' | 'light' | 'gradient';
  copyright_position: 'left' | 'center' | 'right';
}

export interface HeaderMenuItem {
  text: string;
  url: string;
  style: 'link' | 'button' | 'highlight';
}

export interface FooterMenuSection {
  title: string;
  links: Array<{ text: string; url: string }>;
}

export function useLayoutConfig() {
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig | null>(null);
  const [footerConfig, setFooterConfig] = useState<FooterConfig | null>(null);
  const [headerMenuItems, setHeaderMenuItems] = useState<HeaderMenuItem[]>([]);
  const [footerMenuSections, setFooterMenuSections] = useState<FooterMenuSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLayoutConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/homepage.php');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch layout config');
      }

      const content = data.data;

      // Process header config
      const headerData = content.filter((item: any) => item.section === 'header');
      const headerObj: any = {};
      headerData.forEach((item: any) => {
        let value = item.content_value;
        if (item.content_type === 'boolean') {
          value = value === 'true';
        } else if (item.content_type === 'number') {
          value = parseInt(value, 10);
        }
        headerObj[item.content_key] = value;
      });
      setHeaderConfig(headerObj as HeaderConfig);

      // Process footer config
      const footerData = content.filter((item: any) => item.section === 'footer');
      const footerObj: any = {};
      footerData.forEach((item: any) => {
        let value = item.content_value;
        if (item.content_type === 'boolean') {
          value = value === 'true';
        } else if (item.content_type === 'number') {
          value = parseInt(value, 10);
        }
        footerObj[item.content_key] = value;
      });
      setFooterConfig(footerObj as FooterConfig);

      // Process header menu items
      const headerMenuData = content.filter((item: any) => item.section === 'header_menu');
      const headerMenuObj: any = {};
      headerMenuData.forEach((item: any) => {
        headerMenuObj[item.content_key] = item.content_value;
      });

      const headerMenuArray: HeaderMenuItem[] = [];
      for (let i = 1; i <= 10; i++) {
        const text = headerMenuObj[`item_${i}_text`];
        const url = headerMenuObj[`item_${i}_url`];
        const style = headerMenuObj[`item_${i}_style`];
        if (text && url) {
          headerMenuArray.push({ text, url, style: style || 'link' });
        }
      }
      setHeaderMenuItems(headerMenuArray);

      // Process footer menu sections
      const footerMenuData = content.filter((item: any) => item.section === 'footer_menu');
      const footerMenuObj: any = {};
      footerMenuData.forEach((item: any) => {
        footerMenuObj[item.content_key] = item.content_value;
      });

      const footerMenuArray: FooterMenuSection[] = [];
      for (let i = 1; i <= 10; i++) {
        const title = footerMenuObj[`section_${i}_title`];
        const linksString = footerMenuObj[`section_${i}_links`];
        if (title && linksString) {
          const links = linksString.split(',').map((link: string) => {
            const [text, url] = link.split(':');
            return { text: text?.trim() || '', url: url?.trim() || '' };
          }).filter((link: any) => link.text && link.url);
          
          if (links.length > 0) {
            footerMenuArray.push({ title, links });
          }
        }
      }
      setFooterMenuSections(footerMenuArray);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching layout config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayoutConfig();
  }, []);

  return {
    headerConfig,
    footerConfig,
    headerMenuItems,
    footerMenuSections,
    loading,
    error,
    refetch: fetchLayoutConfig,
  };
}

// Default fallback configurations
export const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  show_header: true,
  header_style: 'modern',
  header_background: 'transparent',
  header_position: 'sticky',
  show_search: false,
  show_language_switcher: false,
  show_theme_toggle: true,
  header_height: 80,
  mobile_menu_style: 'slide',
};

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  show_footer: true,
  footer_style: 'modern',
  footer_columns: 4,
  show_newsletter: true,
  show_social_links: true,
  show_back_to_top: true,
  footer_background: 'dark',
  copyright_position: 'center',
};
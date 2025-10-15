/**
 * Breadcrumb Navigation Component
 * Provides navigation breadcrumbs with structured data for SEO
 */

import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbNavigationProps {
  items?: BreadcrumbItem[];
  className?: string;
}

/**
 * Generate breadcrumb items from current path
 */
const generateBreadcrumbsFromPath = (pathname: string): BreadcrumbItem[] => {
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' }
  ];

  let currentPath = '';
  
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;
    
    // Convert segment to readable label
    let label = segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    // Custom labels for specific routes
    const customLabels: Record<string, string> = {
      'faq': 'FAQ',
      'blog': 'Blog',
      'portfolio': 'Portfolio',
      'services': 'Services',
      'about': 'About',
      'contact': 'Contact',
      'testimonials': 'Testimonials',
    };
    
    if (customLabels[segment]) {
      label = customLabels[segment];
    }
    
    breadcrumbs.push({
      label,
      href: currentPath,
      isCurrentPage: isLast
    });
  });

  return breadcrumbs;
};

/**
 * Generate BreadcrumbList structured data
 */
const generateBreadcrumbSchema = (items: BreadcrumbItem[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `https://adilgfx.com${item.href}`
    }))
  };
};

/**
 * Inject breadcrumb structured data
 */
const injectBreadcrumbSchema = (items: BreadcrumbItem[]) => {
  if (typeof document === 'undefined') return;

  const schema = generateBreadcrumbSchema(items);
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);

  return () => {
    if (document.head.contains(script)) {
      document.head.removeChild(script);
    }
  };
};

export function BreadcrumbNavigation({ items, className = "" }: BreadcrumbNavigationProps) {
  const location = useLocation();
  
  // Use provided items or generate from current path
  const breadcrumbItems = items || generateBreadcrumbsFromPath(location.pathname);
  
  // Don't show breadcrumbs on home page or if only home exists
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  useEffect(() => {
    // Inject structured data for breadcrumbs
    const cleanup = injectBreadcrumbSchema(breadcrumbItems);
    return cleanup;
  }, [breadcrumbItems]);

  return (
    <nav 
      className={`flex items-center space-x-1 text-sm text-muted-foreground mb-6 ${className}`}
      aria-label="Breadcrumb navigation"
    >
      <ol className="flex items-center space-x-1" itemScope itemType="https://schema.org/BreadcrumbList">
        {breadcrumbItems.map((item, index) => (
          <li 
            key={item.href}
            className="flex items-center"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
            )}
            
            {item.isCurrentPage ? (
              <span 
                className="text-foreground font-medium"
                itemProp="name"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="hover:text-youtube-red transition-colors flex items-center"
                itemProp="item"
              >
                {index === 0 && <Home className="h-4 w-4 mr-1" />}
                <span itemProp="name">{item.label}</span>
              </Link>
            )}
            
            <meta itemProp="position" content={String(index + 1)} />
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Custom breadcrumb hook for complex pages
 */
export const useBreadcrumbs = (customItems: BreadcrumbItem[]) => {
  const location = useLocation();
  
  useEffect(() => {
    const cleanup = injectBreadcrumbSchema(customItems);
    return cleanup;
  }, [customItems, location.pathname]);
  
  return customItems;
};
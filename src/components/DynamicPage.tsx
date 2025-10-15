import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { usePage, type PageSection } from '@/hooks/usePages';
import { SEOHead } from '@/components/seo-head';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TestimonialSection } from '@/components/testimonials-section';
import { ServicesOverview } from '@/components/services-overview';
import { ContactForm } from '@/components/contact-form';

interface DynamicPageProps {
  slug?: string;
}

export function DynamicPage({ slug: propSlug }: DynamicPageProps) {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = propSlug || paramSlug;
  const { page, loading, error } = usePage(undefined, slug);

  useEffect(() => {
    if (page?.custom_css) {
      const styleElement = document.createElement('style');
      styleElement.id = `page-css-${page.id}`;
      styleElement.textContent = page.custom_css;
      document.head.appendChild(styleElement);

      return () => {
        const existingStyle = document.getElementById(`page-css-${page.id}`);
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [page?.custom_css, page?.id]);

  useEffect(() => {
    if (page?.custom_js) {
      const scriptElement = document.createElement('script');
      scriptElement.id = `page-js-${page.id}`;
      scriptElement.textContent = page.custom_js;
      document.body.appendChild(scriptElement);

      return () => {
        const existingScript = document.getElementById(`page-js-${page.id}`);
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, [page?.custom_js, page?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading page...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return <Navigate to="/404" replace />;
  }

  return (
    <>
      <SEOHead
        title={page.seo_title || page.title}
        description={page.meta_description || `${page.title} - Custom page`}
        keywords={page.meta_keywords}
        canonicalUrl={page.canonical_url}
        image={page.featured_image}
      />

      <div className="min-h-screen">
        {/* Page Header */}
        {page.template !== 'landing' && (
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
                {page.meta_description && (
                  <p className="text-xl text-muted-foreground">{page.meta_description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Main Content */}
            {page.content && (
              <div className="prose prose-lg max-w-none mb-8">
                <div dangerouslySetInnerHTML={{ __html: page.content }} />
              </div>
            )}

            {/* Dynamic Sections */}
            {page.sections && page.sections.length > 0 && (
              <div className="space-y-8">
                {page.sections.map((section, index) => (
                  <PageSection key={index} section={section} />
                ))}
              </div>
            )}

            {/* Featured Image */}
            {page.featured_image && (
              <div className="mt-8">
                <img
                  src={page.featured_image}
                  alt={page.title}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

interface PageSectionProps {
  section: PageSection;
}

function PageSection({ section }: PageSectionProps) {
  const renderSection = () => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="bg-gradient-to-r from-primary to-secondary text-white py-20 rounded-lg">
            <div className="text-center">
              {section.title && (
                <h2 className="text-4xl font-bold mb-4">{section.title}</h2>
              )}
              {section.content && (
                <p className="text-xl mb-8 opacity-90">{section.content}</p>
              )}
              {section.data?.cta_text && section.data?.cta_url && (
                <Button size="lg" variant="secondary" asChild>
                  <a href={section.data.cta_url}>{section.data.cta_text}</a>
                </Button>
              )}
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="prose prose-lg max-w-none">
            {section.title && <h2>{section.title}</h2>}
            {section.content && (
              <div dangerouslySetInnerHTML={{ __html: section.content }} />
            )}
          </div>
        );

      case 'image':
        return (
          <div className="text-center">
            {section.title && (
              <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
            )}
            {section.data?.image_url && (
              <img
                src={section.data.image_url}
                alt={section.title || 'Section image'}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            )}
            {section.content && (
              <p className="mt-4 text-muted-foreground">{section.content}</p>
            )}
          </div>
        );

      case 'gallery':
        return (
          <div>
            {section.title && (
              <h2 className="text-2xl font-bold mb-6 text-center">{section.title}</h2>
            )}
            {section.data?.images && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.data.images.map((image: any, index: number) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={image.alt || `Gallery image ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                ))}
              </div>
            )}
            {section.content && (
              <p className="mt-4 text-center text-muted-foreground">{section.content}</p>
            )}
          </div>
        );

      case 'cta':
        return (
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardContent className="text-center py-12">
              {section.title && (
                <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
              )}
              {section.content && (
                <p className="text-lg mb-8 text-muted-foreground">{section.content}</p>
              )}
              {section.data?.buttons && (
                <div className="flex flex-wrap justify-center gap-4">
                  {section.data.buttons.map((button: any, index: number) => (
                    <Button
                      key={index}
                      size="lg"
                      variant={button.variant || 'default'}
                      asChild
                    >
                      <a href={button.url}>{button.text}</a>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'testimonials':
        return (
          <div>
            {section.title && (
              <h2 className="text-2xl font-bold mb-6 text-center">{section.title}</h2>
            )}
            <TestimonialSection />
          </div>
        );

      case 'services':
        return (
          <div>
            {section.title && (
              <h2 className="text-2xl font-bold mb-6 text-center">{section.title}</h2>
            )}
            <ServicesOverview />
          </div>
        );

      case 'contact_form':
        return (
          <div>
            {section.title && (
              <h2 className="text-2xl font-bold mb-6 text-center">{section.title}</h2>
            )}
            <ContactForm />
          </div>
        );

      case 'custom_html':
        return (
          <div>
            {section.title && (
              <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
            )}
            {section.content && (
              <div dangerouslySetInnerHTML={{ __html: section.content }} />
            )}
          </div>
        );

      default:
        return (
          <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-muted-foreground">
              Unknown section type: {section.type}
            </p>
          </div>
        );
    }
  };

  return <div className="section-container">{renderSection()}</div>;
}
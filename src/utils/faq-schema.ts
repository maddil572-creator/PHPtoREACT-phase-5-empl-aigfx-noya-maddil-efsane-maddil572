/**
 * FAQ Schema Generator
 * Creates structured data for FAQ pages to enable rich snippets
 */

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  category: string;
  questions: FAQItem[];
}

/**
 * Generate FAQ Page schema (JSON-LD)
 */
export const generateFAQPageSchema = (faqData: FAQCategory[]) => {
  // Flatten all questions from all categories
  const allQuestions = faqData.reduce((acc: FAQItem[], category) => {
    return acc.concat(category.questions);
  }, []);

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allQuestions.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};

/**
 * Generate Organization schema for FAQ page
 */
export const generateFAQOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Adil GFX',
    url: 'https://adilgfx.com',
    logo: 'https://adilgfx.com/logo.png',
    description: 'Professional design services for logos, YouTube thumbnails, video editing, and branding.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-123-4567',
      contactType: 'Customer Service',
      email: 'hello@adilgfx.com',
      availableLanguage: 'English',
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
        validFrom: '2024-01-01',
        validThrough: '2025-12-31',
      },
    },
    sameAs: [
      'https://twitter.com/adilgfx',
      'https://instagram.com/adilgfx',
      'https://youtube.com/@adilgfx',
    ],
  };
};

/**
 * Generate Service schema for FAQ page
 */
export const generateFAQServiceSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Professional Design Services',
    description: 'Logo design, YouTube thumbnails, video editing, and complete branding solutions.',
    provider: {
      '@type': 'Organization',
      name: 'Adil GFX',
      url: 'https://adilgfx.com',
    },
    serviceType: 'Graphic Design',
    areaServed: 'Worldwide',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Design Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Logo Design',
            description: 'Professional logo design with unlimited revisions',
          },
          price: '149',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          deliveryLeadTime: {
            '@type': 'QuantitativeValue',
            minValue: 2,
            maxValue: 7,
            unitCode: 'DAY',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'YouTube Thumbnails',
            description: 'High-converting YouTube thumbnail designs',
          },
          price: '49',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          deliveryLeadTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Video Editing',
            description: 'Professional video editing and post-production',
          },
          price: '299',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          deliveryLeadTime: {
            '@type': 'QuantitativeValue',
            minValue: 3,
            maxValue: 10,
            unitCode: 'DAY',
          },
        },
      ],
    },
  };
};

/**
 * Helper to inject multiple schemas into head
 */
export const injectFAQSchemas = (faqData: FAQCategory[]) => {
  if (typeof document === 'undefined') return;

  const schemas = [
    generateFAQPageSchema(faqData),
    generateFAQOrganizationSchema(),
    generateFAQServiceSchema(),
  ];

  const cleanupFunctions: (() => void)[] = [];

  schemas.forEach((schema) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    cleanupFunctions.push(() => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    });
  });

  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
  };
};
import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { SEOHead } from "@/components/seo-head"
import { BreadcrumbNavigation } from "@/components/breadcrumb-navigation"
import { injectFAQSchemas } from "@/utils/faq-schema"
import { fetchFAQs } from "@/utils/api"

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  status: string;
  order: number;
  featured: boolean;
}

interface FAQCategory {
  category: string;
  questions: FAQ[];
}

export default function FAQ() {
  const [faqData, setFaqData] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFAQs();
  }, []);

  useEffect(() => {
    if (faqData.length > 0) {
      // Inject FAQ structured data for rich snippets
      const cleanup = injectFAQSchemas(faqData);
      return cleanup;
    }
  }, [faqData]);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      const response = await fetchFAQs();
      
      // Group FAQs by category
      const groupedFAQs = response.data.reduce((acc: Record<string, FAQ[]>, faq: FAQ) => {
        if (faq.status === 'published') {
          if (!acc[faq.category]) {
            acc[faq.category] = [];
          }
          acc[faq.category].push(faq);
        }
        return acc;
      }, {});

      // Convert to array format and sort
      const faqCategories: FAQCategory[] = Object.entries(groupedFAQs).map(([category, questions]) => ({
        category,
        questions: questions.sort((a, b) => (a.order || 0) - (b.order || 0))
      }));

      setFaqData(faqCategories);
    } catch (err) {
      console.error('Error loading FAQs:', err);
      setError('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Frequently Asked Questions | Adil GFX - Design Services FAQ"
        description="Get answers to common questions about logo design, YouTube thumbnails, video editing services, pricing, timelines, and more. Professional design services with transparent pricing."
        keywords="FAQ, design services, logo design questions, YouTube thumbnail FAQ, video editing help, pricing questions, design process"
        url="https://adilgfx.com/faq"
      />
      
      <main className="pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <BreadcrumbNavigation />
        
        {/* Page header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Frequently Asked <span className="text-gradient-youtube">Questions</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about working with me. Can't find what you're looking for? 
            <a href="/contact" className="text-youtube-red hover:underline ml-1">Get in touch!</a>
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-youtube-red"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadFAQs} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* FAQ Sections */}
        {!loading && !error && faqData.map((category) => (
          <div key={category.category} className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
              <div className="w-8 h-8 bg-gradient-youtube rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">?</span>
              </div>
              {category.category}
            </h2>
            
            <Accordion type="single" collapsible className="space-y-4">
              {category.questions.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`${category.category}-${index}`}
                  className="card-premium"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="font-medium text-foreground pr-4">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}

        {/* Still have questions CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-subtle rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Still Have Questions?
            </h2>
            <p className="text-muted-foreground mb-6">
              I'm here to help! Reach out and I'll get back to you within 2 hours during business hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                className="bg-gradient-youtube hover:shadow-glow transition-all duration-300 font-semibold px-8 py-4"
              >
                Ask a Question
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-youtube-red text-youtube-red hover:bg-youtube-red hover:text-white font-semibold px-8 py-4 transition-smooth"
                onClick={() => window.open('https://wa.me/1234567890', '_blank')}
              >
                WhatsApp Me
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  )
}
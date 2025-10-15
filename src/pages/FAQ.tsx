import { useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { SEOHead } from "@/components/seo-head"
import { BreadcrumbNavigation } from "@/components/breadcrumb-navigation"
import { injectFAQSchemas } from "@/utils/faq-schema"

const faqData = [
  {
    category: "General",
    questions: [
      {
        question: "How long does it typically take to complete a project?",
        answer: "Timeline varies by service: Logo design takes 2-7 days, thumbnails are delivered within 24-48 hours, and video editing ranges from 3-10 days depending on complexity. Rush delivery is available for an additional 50% fee."
      },
      {
        question: "What's included in the final delivery?",
        answer: "All projects include high-resolution files in multiple formats (PNG, JPG, and source files when applicable), commercial usage rights, and a basic style guide. Premium packages include additional formats like SVG, AI, and comprehensive brand guidelines."
      },
      {
        question: "Do you offer unlimited revisions?",
        answer: "Revision policy varies by package. Basic packages include 2-3 revisions, Standard packages include 5 revisions, and Premium packages offer unlimited revisions. Additional revisions beyond the package limit are $25 each."
      }
    ]
  },
  {
    category: "Pricing & Payment",
    questions: [
      {
        question: "What payment methods do you accept?",
        answer: "I accept PayPal, Stripe (credit/debit cards), bank transfers, and cryptocurrency. For larger projects, I offer payment plans with 50% upfront and 50% upon completion."
      },
      {
        question: "Are there any hidden fees?",
        answer: "No hidden fees! All pricing is transparent and listed upfront. The only additional costs would be optional add-ons like rush delivery (+50%), extra revisions ($25 each), or source files ($49) if not included in your package."
      },
      {
        question: "Do you offer refunds?",
        answer: "I offer a 100% satisfaction guarantee. If you're not happy with the initial concepts and we can't resolve it through revisions, I'll provide a full refund. Once revisions begin and you approve directions, the project is considered accepted."
      }
    ]
  },
  {
    category: "Design Process",
    questions: [
      {
        question: "What information do you need to start a project?",
        answer: "I need your brand/channel name, target audience, style preferences, any existing brand elements, preferred colors, and 2-3 reference examples of designs you like. The more details you provide, the better I can match your vision."
      },
      {
        question: "Can I request specific changes during the design process?",
        answer: "Absolutely! Collaboration is key to great design. You can request changes to colors, fonts, layouts, or any other elements during the revision phase. I encourage feedback to ensure the final design exceeds your expectations."
      },
      {
        question: "What if I don't like any of the initial concepts?",
        answer: "This rarely happens, but if none of the initial concepts hit the mark, I'll create new concepts based on your feedback at no extra charge. Your satisfaction is my priority, and I'll work until we find the perfect solution."
      }
    ]
  },
  {
    category: "File Formats & Usage",
    questions: [
      {
        question: "What file formats will I receive?",
        answer: "Standard delivery includes PNG and JPG files. Premium packages include SVG (vector), AI (Adobe Illustrator source), PSD (Photoshop source), and PDF formats. All files are provided in high resolution suitable for both web and print use."
      },
      {
        question: "Can I use the designs for commercial purposes?",
        answer: "Yes! All designs come with full commercial usage rights. You own the final design and can use it however you like - on products, marketing materials, websites, etc. I retain the right to showcase the work in my portfolio unless you request otherwise."
      },
      {
        question: "Will my designs work on social media platforms?",
        answer: "Absolutely! All designs are optimized for digital use and will look great on social media. I provide correctly sized versions for different platforms when needed, and ensure designs are mobile-friendly and web-optimized."
      }
    ]
  },
  {
    category: "Communication & Support",
    questions: [
      {
        question: "How do we communicate during the project?",
        answer: "I primarily use email for detailed communications and file sharing, WhatsApp for quick updates and questions, and can schedule video calls for complex projects. You'll receive regular updates and can reach me anytime during business hours."
      },
      {
        question: "What timezone are you in and when are you available?",
        answer: "I'm available Monday-Friday, 9 AM - 6 PM EST, with extended hours for urgent projects. I typically respond to messages within 2 hours during business hours and within 24 hours on weekends."
      },
      {
        question: "Do you provide ongoing support after project completion?",
        answer: "Yes! I offer 30 days of free minor adjustments after delivery (small text changes, color tweaks, etc.). For major changes or new variations, I provide ongoing support at discounted rates for existing clients."
      }
    ]
  }
]

export default function FAQ() {
  useEffect(() => {
    // Inject FAQ structured data for rich snippets
    const cleanup = injectFAQSchemas(faqData);
    return cleanup;
  }, []);

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

        {/* FAQ Sections */}
        {faqData.map((category) => (
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
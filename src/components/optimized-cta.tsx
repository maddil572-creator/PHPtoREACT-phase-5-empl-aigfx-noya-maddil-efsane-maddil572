/**
 * Optimized CTA Component with A/B Testing
 * Provides different CTA variants for conversion optimization
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Star, Clock, CheckCircle, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/utils/analytics";

interface CTAVariant {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonIcon?: React.ReactNode;
  urgency?: string;
  socialProof?: string;
  backgroundColor?: string;
  buttonStyle?: string;
  features?: string[];
}

interface OptimizedCTAProps {
  variant?: 'hero' | 'blog' | 'service' | 'footer';
  customVariants?: CTAVariant[];
  trackingId?: string;
  className?: string;
}

const defaultVariants: Record<string, CTAVariant[]> = {
  hero: [
    {
      id: 'hero-urgency',
      title: 'Transform Your Brand in 24-48 Hours',
      subtitle: 'Professional designs that convert viewers into loyal customers',
      buttonText: 'Start Your Project Now',
      buttonIcon: <Zap className="h-5 w-5" />,
      urgency: '⚡ Limited slots available this week',
      socialProof: '500+ satisfied clients',
      backgroundColor: 'bg-gradient-subtle',
      buttonStyle: 'bg-gradient-youtube hover:shadow-glow'
    },
    {
      id: 'hero-benefit',
      title: 'Ready to 10X Your Brand Recognition?',
      subtitle: 'Get premium designs that make your competitors jealous',
      buttonText: 'Get My Design Quote',
      buttonIcon: <Star className="h-5 w-5" />,
      socialProof: '⭐ 4.9/5 rating from 500+ clients',
      backgroundColor: 'bg-gradient-subtle',
      buttonStyle: 'bg-gradient-youtube hover:shadow-glow',
      features: ['24-48h delivery', 'Unlimited revisions', '100% satisfaction guarantee']
    },
    {
      id: 'hero-social-proof',
      title: 'Join 500+ Successful Brands',
      subtitle: 'Professional designs trusted by YouTubers, startups, and enterprises',
      buttonText: 'See My Portfolio',
      buttonIcon: <ArrowRight className="h-5 w-5" />,
      socialProof: '🏆 Featured designer on 50+ channels',
      backgroundColor: 'bg-gradient-subtle',
      buttonStyle: 'bg-gradient-youtube hover:shadow-glow'
    }
  ],
  blog: [
    {
      id: 'blog-action',
      title: 'Ready to Elevate Your Brand?',
      subtitle: "Let's create designs that convert. Get in touch today for a free consultation.",
      buttonText: 'Start Your Project',
      buttonIcon: <ArrowRight className="h-5 w-5" />,
      backgroundColor: 'bg-gradient-subtle',
      buttonStyle: 'bg-gradient-youtube hover:shadow-glow'
    },
    {
      id: 'blog-free-consultation',
      title: 'Get Your Free Design Consultation',
      subtitle: 'Discover how professional design can transform your business in just 15 minutes.',
      buttonText: 'Book Free Call',
      buttonIcon: <Clock className="h-5 w-5" />,
      urgency: '📅 Next available slot: Today',
      backgroundColor: 'bg-gradient-subtle',
      buttonStyle: 'bg-gradient-youtube hover:shadow-glow'
    },
    {
      id: 'blog-portfolio',
      title: 'See Real Results from Real Clients',
      subtitle: 'Browse our portfolio of successful projects and client transformations.',
      buttonText: 'View Portfolio',
      buttonIcon: <Star className="h-5 w-5" />,
      socialProof: '📈 Average 300% increase in engagement',
      backgroundColor: 'bg-gradient-subtle',
      buttonStyle: 'bg-gradient-youtube hover:shadow-glow'
    }
  ],
  service: [
    {
      id: 'service-guarantee',
      title: '100% Satisfaction Guaranteed',
      subtitle: 'Love your design or get your money back. No questions asked.',
      buttonText: 'Get Started Risk-Free',
      buttonIcon: <CheckCircle className="h-5 w-5" />,
      features: ['Money-back guarantee', '24-48h delivery', 'Unlimited revisions'],
      backgroundColor: 'bg-gradient-subtle',
      buttonStyle: 'bg-gradient-youtube hover:shadow-glow'
    },
    {
      id: 'service-bonus',
      title: 'Limited Time: Get 2 Bonus Designs FREE',
      subtitle: 'Order any package today and receive 2 additional design concepts at no extra cost.',
      buttonText: 'Claim Bonus Offer',
      buttonIcon: <Gift className="h-5 w-5" />,
      urgency: '⏰ Offer expires in 48 hours',
      backgroundColor: 'bg-gradient-subtle',
      buttonStyle: 'bg-gradient-youtube hover:shadow-glow'
    }
  ],
  footer: [
    {
      id: 'footer-simple',
      title: 'Ready to Get Started?',
      subtitle: 'Transform your brand with professional design services.',
      buttonText: 'Contact Me',
      buttonIcon: <ArrowRight className="h-5 w-5" />,
      backgroundColor: 'bg-gradient-subtle',
      buttonStyle: 'bg-gradient-youtube hover:shadow-glow'
    }
  ]
};

export function OptimizedCTA({
  variant = 'blog',
  customVariants,
  trackingId,
  className = ""
}: OptimizedCTAProps) {
  const [selectedVariant, setSelectedVariant] = useState<CTAVariant | null>(null);
  const [hasTracked, setHasTracked] = useState(false);
  const analytics = useAnalytics();

  useEffect(() => {
    // Select variant for A/B testing
    const variants = customVariants || defaultVariants[variant] || defaultVariants.blog;
    
    // Get or set A/B test variant from localStorage for consistency
    const storageKey = `cta-variant-${variant}-${trackingId || 'default'}`;
    let storedVariantId = localStorage.getItem(storageKey);
    
    if (!storedVariantId || !variants.find(v => v.id === storedVariantId)) {
      // Randomly select a variant
      const randomIndex = Math.floor(Math.random() * variants.length);
      storedVariantId = variants[randomIndex].id;
      localStorage.setItem(storageKey, storedVariantId);
    }
    
    const variant_obj = variants.find(v => v.id === storedVariantId) || variants[0];
    setSelectedVariant(variant_obj);
    
    // Track variant impression
    if (!hasTracked && variant_obj) {
      analytics.track(analytics.events.CTA_IMPRESSION, {
        variant_id: variant_obj.id,
        variant_type: variant,
        tracking_id: trackingId
      });
      setHasTracked(true);
    }
  }, [variant, customVariants, trackingId, analytics, hasTracked]);

  const handleCTAClick = () => {
    if (selectedVariant) {
      analytics.track(analytics.events.CTA_CLICK, {
        variant_id: selectedVariant.id,
        variant_type: variant,
        tracking_id: trackingId,
        button_text: selectedVariant.buttonText
      });
    }
  };

  if (!selectedVariant) {
    return null;
  }

  const ctaContent = (
    <div className={`rounded-2xl p-8 text-center ${selectedVariant.backgroundColor || 'bg-gradient-subtle'} ${className}`}>
      {/* Urgency indicator */}
      {selectedVariant.urgency && (
        <div className="inline-flex items-center bg-youtube-red/10 text-youtube-red px-4 py-2 rounded-full text-sm font-medium mb-4">
          {selectedVariant.urgency}
        </div>
      )}
      
      {/* Main content */}
      <h2 className="text-2xl font-bold text-foreground mb-4">
        {selectedVariant.title}
      </h2>
      
      <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
        {selectedVariant.subtitle}
      </p>
      
      {/* Features list */}
      {selectedVariant.features && (
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {selectedVariant.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* CTA Button */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
        <Link to="/contact" onClick={handleCTAClick}>
          <Button 
            size="lg"
            className={`font-semibold px-8 py-4 transition-all duration-300 transform hover:scale-105 ${selectedVariant.buttonStyle || 'bg-gradient-youtube hover:shadow-glow'}`}
          >
            {selectedVariant.buttonIcon && (
              <span className="mr-2">{selectedVariant.buttonIcon}</span>
            )}
            {selectedVariant.buttonText}
          </Button>
        </Link>
        
        {/* Secondary action for some variants */}
        {selectedVariant.id.includes('portfolio') && (
          <Link to="/portfolio" onClick={handleCTAClick}>
            <Button 
              variant="outline"
              size="lg"
              className="border-2 border-youtube-red text-youtube-red hover:bg-youtube-red hover:text-white font-semibold px-8 py-4 transition-smooth"
            >
              View Portfolio
            </Button>
          </Link>
        )}
      </div>
      
      {/* Social proof */}
      {selectedVariant.socialProof && (
        <p className="text-sm text-muted-foreground">
          {selectedVariant.socialProof}
        </p>
      )}
    </div>
  );

  return ctaContent;
}

/**
 * Hook for tracking CTA performance
 */
export const useCTATracking = (variantId: string, variantType: string) => {
  const analytics = useAnalytics();
  
  const trackConversion = (conversionType: 'contact' | 'portfolio' | 'call' | 'email') => {
    analytics.track(analytics.events.CTA_CONVERSION, {
      variant_id: variantId,
      variant_type: variantType,
      conversion_type: conversionType
    });
  };
  
  return { trackConversion };
};
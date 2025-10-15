/**
 * Returning Visitor Banner Component
 * Personalized welcome banner for returning visitors
 */

import { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSiteLinks } from '@/hooks/useSiteLinks';

const LAST_VISIT_KEY = 'last_visit';
const BANNER_DISMISSED_KEY = 'returning_banner_dismissed';

export function ReturningVisitorBanner() {
  const { links } = useSiteLinks();
  const [isVisible, setIsVisible] = useState(false);
  const [daysSinceLastVisit, setDaysSinceLastVisit] = useState(0);

  useEffect(() => {
    checkReturningVisitor();
  }, []);

  const checkReturningVisitor = () => {
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    const bannerDismissed = sessionStorage.getItem(BANNER_DISMISSED_KEY);
    
    if (bannerDismissed) {
      return;
    }

    const now = Date.now();
    
    if (lastVisit) {
      const lastVisitTime = parseInt(lastVisit, 10);
      const daysDiff = Math.floor((now - lastVisitTime) / (1000 * 60 * 60 * 24));
      
      // Show banner if returning after at least 1 day
      if (daysDiff >= 1) {
        setDaysSinceLastVisit(daysDiff);
        setIsVisible(true);
      }
    }
    
    // Update last visit timestamp
    localStorage.setItem(LAST_VISIT_KEY, now.toString());
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem(BANNER_DISMISSED_KEY, 'true');
  };

  const handleClaim = () => {
    // Navigate to contact with special offer
    window.location.href = `${links.contact}?promo=returning15`;
    handleDismiss();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-fade-in">
      <div className="bg-gradient-youtube rounded-xl shadow-glow p-4 md:p-6">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Gift className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg mb-1">
              Welcome Back! 🎉
            </h3>
            <p className="text-white/90 text-sm mb-3">
              {daysSinceLastVisit === 1 
                ? "It's been a day since your last visit. "
                : `It's been ${daysSinceLastVisit} days since your last visit. `}
              Here's an exclusive <strong>15% discount</strong> on your next project as a thank you for coming back!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleClaim}
                className="bg-white text-youtube-red hover:bg-white/90 font-semibold"
                size="sm"
              >
                Claim Your 15% Off
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                className="text-white hover:bg-white/20"
                size="sm"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

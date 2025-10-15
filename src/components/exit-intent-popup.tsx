/**
 * Exit Intent Popup Component
 * Captures leads when users are about to leave the site
 */

import { useState, useEffect } from "react";
import { X, Gift, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAnalytics } from "@/utils/analytics";

interface ExitIntentPopupProps {
  title?: string;
  subtitle?: string;
  offer?: string;
  buttonText?: string;
  delay?: number; // Minimum time on page before showing (ms)
  showOnMobile?: boolean;
}

export function ExitIntentPopup({
  title = "Wait! Don't Leave Empty-Handed 🎁",
  subtitle = "Get 5 FREE YouTube Thumbnail Templates",
  offer = "Professional templates that have generated millions of views. Download instantly!",
  buttonText = "Get My Free Templates",
  delay = 30000, // 30 seconds
  showOnMobile = false
}: ExitIntentPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [timeOnPage, setTimeOnPage] = useState(0);
  
  const { toast } = useToast();
  const analytics = useAnalytics();

  useEffect(() => {
    // Check if popup has been shown in this session
    const popupShown = sessionStorage.getItem('exitIntentShown');
    if (popupShown) {
      setHasShown(true);
      return;
    }

    // Track time on page
    const startTime = Date.now();
    const timer = setInterval(() => {
      setTimeOnPage(Date.now() - startTime);
    }, 1000);

    // Exit intent detection
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves from top of viewport
      if (e.clientY <= 0 && !hasShown && timeOnPage >= delay) {
        // Don't show on mobile unless explicitly enabled
        if (!showOnMobile && window.innerWidth <= 768) return;
        
        setIsOpen(true);
        setHasShown(true);
        sessionStorage.setItem('exitIntentShown', 'true');
        
        // Track exit intent event
        analytics.track(analytics.events.EXIT_INTENT_TRIGGERED, {
          time_on_page: Math.round(timeOnPage / 1000),
          page_url: window.location.pathname
        });
      }
    };

    // Scroll-based trigger (backup for mobile)
    let maxScroll = 0;
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      maxScroll = Math.max(maxScroll, scrollPercent);
      
      // Trigger if user scrolled 70% and tries to scroll back up quickly
      if (maxScroll > 70 && scrollPercent < maxScroll - 10 && !hasShown && timeOnPage >= delay) {
        if (showOnMobile || window.innerWidth > 768) {
          setIsOpen(true);
          setHasShown(true);
          sessionStorage.setItem('exitIntentShown', 'true');
          
          analytics.track(analytics.events.EXIT_INTENT_TRIGGERED, {
            trigger: 'scroll',
            time_on_page: Math.round(timeOnPage / 1000),
            max_scroll: Math.round(maxScroll)
          });
        }
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [hasShown, timeOnPage, delay, showOnMobile, analytics]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      toast({
        title: "Required fields",
        description: "Please enter your name and email",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Track conversion
      analytics.track(analytics.events.LEAD_CAPTURED, {
        source: 'exit_intent_popup',
        lead_magnet: 'youtube_templates',
        email,
        name,
        time_on_page: Math.round(timeOnPage / 1000)
      });

      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubmitted(true);
      
      toast({
        title: "Success! 🎉",
        description: "Check your email for the download link",
      });
      
      // Auto-close after success
      setTimeout(() => {
        setIsOpen(false);
      }, 3000);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    analytics.track(analytics.events.EXIT_INTENT_DISMISSED, {
      time_shown: Date.now() - timeOnPage
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md border-2 border-youtube-red/20 shadow-glow">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-youtube rounded-full flex items-center justify-center mb-4">
            <Gift className="h-8 w-8 text-white" />
          </div>
          
          <DialogTitle className="text-2xl font-bold text-foreground">
            {title}
          </DialogTitle>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-youtube-red">
              {subtitle}
            </h3>
            <p className="text-sm text-muted-foreground">
              {offer}
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Your first name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-center"
                  required
                />
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-center"
                  required
                />
              </div>
              
              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-youtube hover:shadow-glow transition-all duration-300 font-semibold text-lg py-6"
              >
                {isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    {buttonText}
                  </>
                )}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                🔒 Your email is safe. No spam, unsubscribe anytime.
              </p>
            </form>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <Download className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Templates Sent! 🎉
                </h3>
                <p className="text-sm text-muted-foreground">
                  Check your email for the download link. It should arrive within 2 minutes.
                </p>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="mt-4"
              >
                Continue Browsing
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>

        {/* Social proof */}
        {!isSubmitted && (
          <div className="text-center pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              ⭐ Join 2,500+ designers who downloaded these templates
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to control exit intent popup
 */
export const useExitIntentPopup = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  
  const disable = () => {
    setIsEnabled(false);
    sessionStorage.setItem('exitIntentShown', 'true');
  };
  
  const enable = () => {
    setIsEnabled(true);
    sessionStorage.removeItem('exitIntentShown');
  };
  
  return { isEnabled, disable, enable };
};
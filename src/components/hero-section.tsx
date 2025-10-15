import { ArrowRight, Play, Star } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { OptimizedCTA } from "@/components/optimized-cta"
import { useHomepageContent } from "@/hooks/useHomepageContent"

export function HeroSection() {
  const { getContent, loading } = useHomepageContent()
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-subtle"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-youtube rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-creative rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-card border border-border rounded-full px-4 py-2 shadow-small">
            <Star className="h-4 w-4 text-youtube-red fill-current" />
            <span className="text-sm font-medium text-muted-foreground">
              {loading ? 'Trusted by 500+ YouTubers & Brands' : getContent('hero', 'badge_text', 'Trusted by 500+ YouTubers & Brands')}
            </span>
          </div>

          {/* Main headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              {loading ? (
                <>
                  Transform Your Brand with
                  <span className="text-gradient-youtube block">
                    Premium Designs
                  </span>
                </>
              ) : (
                <span className="text-gradient-youtube">
                  {getContent('hero', 'main_headline', 'Transform Your Brand with Premium Designs')}
                </span>
              )}
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {loading 
                ? 'Professional logo design, YouTube thumbnails, and video editing that converts viewers into loyal customers. Ready in 24-48 hours.'
                : getContent('hero', 'subtitle', 'Professional logo design, YouTube thumbnails, and video editing that converts viewers into loyal customers. Ready in 24-48 hours.')
              }
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link to={loading ? "/contact" : getContent('hero', 'cta_primary_link', '/contact')}>
              <Button 
                size="lg" 
                className="bg-gradient-youtube hover:shadow-glow transition-all duration-300 transform hover:scale-105 font-semibold text-lg px-8 py-4"
              >
                {loading ? 'Start Your Project' : getContent('hero', 'cta_primary_text', 'Start Your Project')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to={loading ? "/about" : getContent('hero', 'cta_secondary_link', '/about')}>
              <Button 
                variant="secondary" 
                size="lg"
                className="font-semibold text-lg px-8 py-4 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in"
              >
                <Play className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                {loading ? 'Watch My Intro' : getContent('hero', 'cta_secondary_text', 'Watch My Intro')}
              </Button>
            </Link>
            <Link to={loading ? "/portfolio" : getContent('hero', 'cta_tertiary_link', '/portfolio')}>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-youtube-red text-youtube-red hover:bg-youtube-red hover:text-white font-semibold text-lg px-8 py-4 transition-smooth"
              >
                <Play className="mr-2 h-5 w-5" />
                {loading ? 'Watch Portfolio' : getContent('hero', 'cta_tertiary_text', 'Watch Portfolio')}
              </Button>
            </Link>
          </div>
          
          {/* A/B Test CTA Section */}
          <div className="pt-16">
            <OptimizedCTA 
              variant="hero" 
              trackingId="hero-main"
              className="max-w-4xl mx-auto"
            />
          </div>

          {/* Trust indicators */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {loading ? '500+' : getContent('hero', 'stat_clients', '500+')}
              </div>
              <div className="text-sm text-muted-foreground">
                {loading ? 'Happy Clients' : getContent('hero', 'stat_clients_label', 'Happy Clients')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {loading ? '24-48h' : getContent('hero', 'stat_delivery', '24-48h')}
              </div>
              <div className="text-sm text-muted-foreground">
                {loading ? 'Delivery Time' : getContent('hero', 'stat_delivery_label', 'Delivery Time')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {loading ? '99%' : getContent('hero', 'stat_satisfaction', '99%')}
              </div>
              <div className="text-sm text-muted-foreground">
                {loading ? 'Satisfaction Rate' : getContent('hero', 'stat_satisfaction_label', 'Satisfaction Rate')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {loading ? '5.0★' : getContent('hero', 'stat_rating', '5.0★')}
              </div>
              <div className="text-sm text-muted-foreground">
                {loading ? 'Average Rating' : getContent('hero', 'stat_rating_label', 'Average Rating')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCarousel } from '@/hooks/useCarousels';
import { cn } from '@/lib/utils';

interface DynamicCarouselProps {
  carouselId?: number;
  carouselSlug?: string;
  className?: string;
  showControls?: boolean;
}

export function DynamicCarousel({ 
  carouselId, 
  carouselSlug, 
  className,
  showControls = true 
}: DynamicCarouselProps) {
  const { carousel, loading, error } = useCarousel(carouselId, carouselSlug);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (carousel?.autoplay && isPlaying && !isPaused && carousel.slides && carousel.slides.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide(prev => {
          if (carousel.infinite_loop) {
            return (prev + (carousel.slides_to_scroll || 1)) % carousel.slides!.length;
          } else {
            const next = prev + (carousel.slides_to_scroll || 1);
            return next >= carousel.slides!.length ? 0 : next;
          }
        });
      }, carousel.autoplay_speed || 5000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [carousel, isPlaying, isPaused]);

  const handlePrevious = () => {
    if (!carousel?.slides) return;
    
    setCurrentSlide(prev => {
      if (carousel.infinite_loop) {
        return prev === 0 ? carousel.slides!.length - (carousel.slides_to_scroll || 1) : prev - (carousel.slides_to_scroll || 1);
      } else {
        return Math.max(0, prev - (carousel.slides_to_scroll || 1));
      }
    });
  };

  const handleNext = () => {
    if (!carousel?.slides) return;
    
    setCurrentSlide(prev => {
      if (carousel.infinite_loop) {
        return (prev + (carousel.slides_to_scroll || 1)) % carousel.slides!.length;
      } else {
        const next = prev + (carousel.slides_to_scroll || 1);
        return next >= carousel.slides!.length ? carousel.slides!.length - 1 : next;
      }
    });
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMouseEnter = () => {
    if (carousel?.pause_on_hover) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (carousel?.pause_on_hover) {
      setIsPaused(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("relative w-full h-64 bg-muted rounded-lg flex items-center justify-center", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading carousel...</p>
        </div>
      </div>
    );
  }

  if (error || !carousel || !carousel.slides || carousel.slides.length === 0) {
    return (
      <div className={cn("relative w-full h-64 bg-muted rounded-lg flex items-center justify-center", className)}>
        <p className="text-muted-foreground">No carousel content available</p>
      </div>
    );
  }

  if (carousel.status !== 'active') {
    return null;
  }

  const slides = carousel.slides.filter(slide => slide.is_active !== false);
  const slidesToShow = carousel.slides_to_show || 1;
  const visibleSlides = slides.slice(currentSlide, currentSlide + slidesToShow);

  // Fill remaining slots if we're at the end and infinite loop is enabled
  if (carousel.infinite_loop && visibleSlides.length < slidesToShow) {
    const remaining = slidesToShow - visibleSlides.length;
    visibleSlides.push(...slides.slice(0, remaining));
  }

  return (
    <div 
      className={cn("relative w-full overflow-hidden rounded-lg", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Carousel Container */}
      <div className="relative">
        <div 
          className={cn(
            "flex transition-all duration-500 ease-in-out",
            carousel.animation_type === 'fade' && "opacity-100",
            carousel.animation_type === 'zoom' && "transform scale-100"
          )}
          style={{
            transform: carousel.animation_type === 'slide' 
              ? `translateX(-${currentSlide * (100 / slidesToShow)}%)`
              : undefined,
            transitionDuration: `${carousel.animation_speed || 500}ms`
          }}
        >
          {slidesToShow === 1 ? (
            // Single slide view
            <CarouselSlideComponent 
              slide={slides[currentSlide]} 
              carousel={carousel}
              className="w-full flex-shrink-0"
            />
          ) : (
            // Multiple slides view
            slides.map((slide, index) => (
              <CarouselSlideComponent 
                key={index}
                slide={slide} 
                carousel={carousel}
                className={cn(
                  "flex-shrink-0",
                  `w-${Math.floor(100 / slidesToShow)}%`
                )}
                style={{ width: `${100 / slidesToShow}%` }}
              />
            ))
          )}
        </div>

        {/* Navigation Arrows */}
        {carousel.show_arrows && showControls && slides.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background"
              onClick={handlePrevious}
              disabled={!carousel.infinite_loop && currentSlide === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background"
              onClick={handleNext}
              disabled={!carousel.infinite_loop && currentSlide >= slides.length - slidesToShow}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Play/Pause Button */}
        {carousel.autoplay && showControls && slides.length > 1 && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 bg-background/80 hover:bg-background"
            onClick={togglePlayPause}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Dot Indicators */}
      {carousel.show_dots && showControls && slides.length > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {slides.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === currentSlide 
                  ? "bg-primary w-6" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CarouselSlideComponentProps {
  slide: any;
  carousel: any;
  className?: string;
  style?: React.CSSProperties;
}

function CarouselSlideComponent({ slide, carousel, className, style }: CarouselSlideComponentProps) {
  const slideStyle = {
    backgroundColor: slide.background_color || undefined,
    color: slide.text_color || undefined,
    ...style,
  };

  const renderSlideContent = () => {
    switch (carousel.type) {
      case 'hero':
        return (
          <div className="relative h-96 flex items-center justify-center text-center">
            {slide.image_url && (
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${slide.image_url})` }}
              />
            )}
            <div className="relative z-10 max-w-4xl mx-auto px-6">
              {slide.title && (
                <h1 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h1>
              )}
              {slide.subtitle && (
                <h2 className="text-xl md:text-2xl mb-6 opacity-90">{slide.subtitle}</h2>
              )}
              {slide.description && (
                <p className="text-lg mb-8 opacity-80">{slide.description}</p>
              )}
              {slide.link_url && slide.link_text && (
                <Button 
                  size="lg" 
                  variant={slide.button_style || 'primary'}
                  asChild
                >
                  <a 
                    href={slide.link_url} 
                    target={slide.link_target || '_self'}
                  >
                    {slide.link_text}
                  </a>
                </Button>
              )}
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <Card className="h-full">
            <CardContent className="p-6 text-center">
              {slide.description && (
                <blockquote className="text-lg italic mb-4">
                  "{slide.description}"
                </blockquote>
              )}
              {slide.title && (
                <cite className="font-semibold">{slide.title}</cite>
              )}
              {slide.subtitle && (
                <p className="text-sm text-muted-foreground">{slide.subtitle}</p>
              )}
            </CardContent>
          </Card>
        );

      case 'portfolio':
        return (
          <Card className="h-full overflow-hidden">
            {slide.image_url && (
              <div className="aspect-video bg-cover bg-center bg-no-repeat"
                   style={{ backgroundImage: `url(${slide.image_url})` }} />
            )}
            <CardContent className="p-4">
              {slide.title && (
                <h3 className="font-semibold mb-2">{slide.title}</h3>
              )}
              {slide.description && (
                <p className="text-sm text-muted-foreground mb-3">{slide.description}</p>
              )}
              {slide.link_url && slide.link_text && (
                <Button 
                  size="sm" 
                  variant={slide.button_style || 'primary'}
                  asChild
                >
                  <a 
                    href={slide.link_url} 
                    target={slide.link_target || '_self'}
                  >
                    {slide.link_text}
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        );

      case 'images':
      default:
        return (
          <div className="relative">
            {slide.image_url && (
              <img 
                src={slide.image_url} 
                alt={slide.title || 'Carousel slide'}
                className="w-full h-auto object-cover"
              />
            )}
            {(slide.title || slide.description || slide.link_url) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                {slide.title && (
                  <h3 className="text-xl font-semibold mb-2">{slide.title}</h3>
                )}
                {slide.description && (
                  <p className="mb-4 opacity-90">{slide.description}</p>
                )}
                {slide.link_url && slide.link_text && (
                  <Button 
                    variant={slide.button_style || 'secondary'}
                    asChild
                  >
                    <a 
                      href={slide.link_url} 
                      target={slide.link_target || '_self'}
                    >
                      {slide.link_text}
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={className} style={slideStyle}>
      {slide.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: slide.custom_css }} />
      )}
      {renderSlideContent()}
    </div>
  );
}
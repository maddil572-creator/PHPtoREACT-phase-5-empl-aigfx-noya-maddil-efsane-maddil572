import { Star, Quote, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { usePublicTestimonials } from "@/hooks/usePublicTestimonials"
import { useSiteLinks } from "@/hooks/useSiteLinks"
import { SEOHead } from "@/components/seo-head"

export default function Testimonials() {
  const { testimonials, loading, error } = usePublicTestimonials(false) // Get all testimonials
  const { links } = useSiteLinks()
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + displayTestimonials.length) % displayTestimonials.length)
  }

  // Fallback testimonials if database is empty
  const fallbackTestimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "YouTube Creator (2.5M+ Subscribers)",
      content: "Adil's thumbnails increased my CTR from 3% to 15%! My channel growth exploded after working with him. The designs are simply outstanding and drive real results.",
      rating: 5,
      avatar: "/api/placeholder/80/80",
      featured: true
    },
    {
      id: 2,
      name: "Mike Rodriguez",
      role: "Tech Startup Founder",
      content: "The logo Adil designed became the cornerstone of our $10M startup success. Professional, creative, and delivered exactly what we envisioned. Worth every penny!",
      rating: 5,
      avatar: "/api/placeholder/80/80",
      featured: true
    },
    {
      id: 3,
      name: "Emma Chen",
      role: "Marketing Director",
      content: "Working with Adil was seamless. Fast delivery, unlimited revisions, and results that exceeded our expectations. Highly recommended!",
      rating: 5,
      avatar: "/api/placeholder/80/80",
      featured: true
    }
  ]

  const displayTestimonials = testimonials.length > 0 ? testimonials : fallbackTestimonials

  if (loading) {
    return (
      <>
        <SEOHead 
          title="Client Testimonials & Success Stories | Adil GFX"
          description="Read what our clients say about our design services. Real testimonials from YouTubers, startups, and businesses who achieved amazing results."
          url="https://adilgfx.com/testimonials"
        />
        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Skeleton className="h-12 w-96 mx-auto mb-4" />
              <Skeleton className="h-6 w-[600px] mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-96 w-full" />
              ))}
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <SEOHead
        title="Client Testimonials & Success Stories | Adil GFX"
        description="Read what our clients say about our design services. Real testimonials from YouTubers, startups, and businesses who achieved amazing results."
        keywords="client testimonials, design reviews, success stories, client feedback, adil gfx reviews"
        url="https://adilgfx.com/testimonials"
      />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              What Clients <span className="text-gradient-youtube">Say</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real testimonials from real clients who achieved real results. See why hundreds of businesses and creators trust us with their visual identity.
            </p>
          </div>

          {/* Featured Testimonial Carousel */}
          {displayTestimonials.length > 0 && (
            <div className="mb-20">
              <div className="relative bg-gradient-subtle rounded-2xl p-8 md:p-12">
                <div className="text-center max-w-4xl mx-auto">
                  <Quote className="h-12 w-12 text-youtube-red mx-auto mb-6" />
                  
                  <blockquote className="text-2xl md:text-3xl font-medium text-foreground mb-8 leading-relaxed">
                    "{displayTestimonials[currentIndex].content}"
                  </blockquote>
                  
                  <div className="flex items-center justify-center mb-6">
                    {[...Array(displayTestimonials[currentIndex].rating || 5)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 text-youtube-red fill-current" />
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-center space-x-4">
                    <img 
                      src={displayTestimonials[currentIndex].avatar || "/api/placeholder/80/80"} 
                      alt={displayTestimonials[currentIndex].name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="text-left">
                      <div className="font-semibold text-foreground text-lg">
                        {displayTestimonials[currentIndex].name}
                      </div>
                      <div className="text-muted-foreground">
                        {displayTestimonials[currentIndex].role}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                {displayTestimonials.length > 1 && (
                  <>
                    <button
                      onClick={prevTestimonial}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-200"
                    >
                      <ArrowLeft className="h-5 w-5 text-foreground" />
                    </button>
                    <button
                      onClick={nextTestimonial}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-200"
                    >
                      <ArrowRight className="h-5 w-5 text-foreground" />
                    </button>
                  </>
                )}

                {/* Dots indicator */}
                {displayTestimonials.length > 1 && (
                  <div className="flex justify-center space-x-2 mt-8">
                    {displayTestimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                          index === currentIndex ? 'bg-youtube-red' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Testimonials Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              All Client Reviews
            </h2>
            
            {displayTestimonials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayTestimonials.map((testimonial) => (
                  <div key={testimonial.id} className="card-premium text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-youtube rounded-full mb-6">
                      <Quote className="h-6 w-6 text-white" />
                    </div>

                    <div className="flex justify-center space-x-1 mb-4">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-youtube-red fill-current" />
                      ))}
                    </div>

                    <blockquote className="text-muted-foreground mb-6 italic">
                      "{testimonial.content}"
                    </blockquote>

                    <div className="flex items-center justify-center space-x-3">
                      <img 
                        src={testimonial.avatar || "/api/placeholder/80/80"} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="text-left">
                        <div className="font-semibold text-foreground">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-8">No testimonials available at the moment.</p>
                <Button onClick={() => window.location.href = links.contact}>
                  Be Our First Review
                </Button>
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="bg-card rounded-2xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Trusted by <span className="text-gradient-youtube">Hundreds</span>
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-youtube-red mb-2">500+</div>
                <div className="text-muted-foreground">Happy Clients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-youtube-red mb-2">5.0★</div>
                <div className="text-muted-foreground">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-youtube-red mb-2">24-48h</div>
                <div className="text-muted-foreground">Delivery Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-youtube-red mb-2">99%</div>
                <div className="text-muted-foreground">Satisfaction Rate</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-subtle rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Join Our Success Stories?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Let's create something amazing together. Start your project today and become our next success story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-youtube hover:shadow-glow font-medium px-8"
                onClick={() => window.location.href = links.contact}
              >
                Start Your Project
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-youtube-red text-youtube-red hover:bg-youtube-red hover:text-white font-medium px-8"
                onClick={() => window.location.href = links.portfolio}
              >
                View Our Work
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
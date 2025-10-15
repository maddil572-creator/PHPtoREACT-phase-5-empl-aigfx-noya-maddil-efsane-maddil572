import { ExternalLink, Eye } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicPortfolio } from "@/hooks/usePublicPortfolio"
import { useSiteLinks } from "@/hooks/useSiteLinks"

export function PortfolioHighlights() {
  const { portfolio, loading, error } = usePublicPortfolio(true, 4)
  const { links } = useSiteLinks()
  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Portfolio That <span className="text-gradient-youtube">Converts</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real projects, real results. See how my designs helped clients grow their businesses and increase engagement.
          </p>
        </div>

        {/* Portfolio grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {loading ? (
            // Loading skeletons
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden shadow-small">
                <Skeleton className="aspect-video w-full" />
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">Unable to load portfolio at the moment.</p>
            </div>
          ) : (
            portfolio.map((item) => (
              <div 
                key={item.id} 
                className="portfolio-item bg-card rounded-xl overflow-hidden shadow-small hover:shadow-premium transition-all duration-500 group"
              >
                {/* Image container */}
                <div className="relative aspect-video bg-muted">
                  <img 
                    src={item.image || "/api/placeholder/400/300"} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="portfolio-overlay">
                    <div className="text-white">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="text-sm opacity-90">{item.category}</p>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(item.tags || [item.category]).map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                  {item.results && (
                    <p className="text-youtube-red text-sm font-medium mt-2">📈 {item.results}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to={links.portfolio}>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-youtube-red text-youtube-red hover:bg-youtube-red hover:text-white font-semibold px-8 py-4 transition-smooth"
            >
              View Full Portfolio
              <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
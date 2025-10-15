/**
 * Portfolio Page with Pagination and Category Filtering
 * Displays portfolio items with pagination support
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Eye, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { useSiteLinks } from "@/hooks/useSiteLinks";
import { fetchPortfolio } from "@/utils/api";
import { PortfolioGridSkeleton } from "@/components/skeleton-loader";
import { SEOHead } from "@/components/seo-head";
import { useAnalytics } from "@/utils/analytics";
import type { PortfolioItem } from "@/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const categories = ["All", "Logos", "Thumbnails", "Video Editing", "YouTube Branding"];
const ITEMS_PER_PAGE = 9;

export default function Portfolio() {
  const { links } = useSiteLinks();
  const [searchParams, setSearchParams] = useSearchParams();
  const analytics = useAnalytics();

  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const pageParam = searchParams.get('page');
    const categoryParam = searchParams.get('category');
    
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const category = categoryParam || 'All';
    
    setCurrentPage(page);
    setActiveCategory(category);
    loadPortfolio(page, category);
  }, [searchParams]);

  const loadPortfolio = async (page: number, category: string) => {
    setLoading(true);
    const response = await fetchPortfolio(page, ITEMS_PER_PAGE, category);
    setPortfolioItems(response.data);
    setTotalPages(response.totalPages);
    setLoading(false);

    // Track portfolio view
    analytics.track(analytics.events.PORTFOLIO_VIEW, {
      page,
      category,
    });
  };

  const handlePageChange = (page: number) => {
    const params: Record<string, string> = { page: page.toString() };
    if (activeCategory !== 'All') {
      params.category = activeCategory;
    }
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (category: string) => {
    const params: Record<string, string> = { page: '1' };
    if (category !== 'All') {
      params.category = category;
    }
    setSearchParams(params);
  };

  return (
    <>
      <SEOHead
        title="Portfolio - Real Projects, Real Results | Adil GFX"
        description="View our portfolio of logos, YouTube thumbnails, video editing, and branding projects. Each design is crafted to drive measurable business growth."
        keywords="design portfolio, logo design, YouTube thumbnails, video editing, branding"
      />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Portfolio That <span className="text-gradient-youtube">Drives Results</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real projects, real results. Each design is crafted to not just look amazing, but to drive measurable business growth for my clients.
            </p>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => handleCategoryChange(category)}
                className={`font-medium transition-smooth ${
                  activeCategory === category
                    ? "bg-gradient-youtube text-white"
                    : "border-youtube-red text-youtube-red hover:bg-youtube-red hover:text-white"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Before/After showcase */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center text-foreground mb-8">
              See the <span className="text-gradient-youtube">Transformation</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <BeforeAfterSlider
                  beforeImage="/api/placeholder/600/400"
                  afterImage="/api/placeholder/600/400"
                  beforeLabel="Old Design"
                  afterLabel="New Design"
                  className="mb-4"
                />
                <h3 className="font-semibold text-foreground mb-2">YouTube Thumbnail Redesign</h3>
                <p className="text-sm text-muted-foreground">CTR increased from 2% to 15% after the redesign</p>
              </div>
              <div>
                <BeforeAfterSlider
                  beforeImage="/api/placeholder/600/400"
                  afterImage="/api/placeholder/600/400"
                  beforeLabel="Before"
                  afterLabel="After"
                  className="mb-4"
                />
                <h3 className="font-semibold text-foreground mb-2">Brand Logo Evolution</h3>
                <p className="text-sm text-muted-foreground">Modern redesign that helped secure $2M funding</p>
              </div>
            </div>
          </div>

          {/* Portfolio grid */}
          {loading ? (
            <PortfolioGridSkeleton />
          ) : (
            <>
              {portfolioItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No portfolio items found in this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                  {portfolioItems.map((item) => (
                    <div 
                      key={item.id}
                      className="portfolio-item bg-card rounded-xl overflow-hidden shadow-small hover:shadow-premium transition-all duration-500 group"
                    >
                      <div className="relative aspect-video bg-muted">
                        <img 
                          src={item.featuredImage} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="portfolio-overlay">
                          <div className="text-white">
                            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                            <div className="flex items-center space-x-2">
                              <Button variant="secondary" size="sm" aria-label="View details">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                              <Button variant="secondary" size="sm" aria-label="External link">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {item.tags.map((tag) => (
                            <span 
                              key={tag}
                              className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                        <p className="text-muted-foreground text-sm mb-3">{item.description}</p>
                        
                        <div className="bg-gradient-youtube/10 text-youtube-red px-3 py-2 rounded-lg text-sm font-medium">
                          📈 {item.results.metric1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mb-16">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        aria-label="Previous page"
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={page === currentPage}
                          className="cursor-pointer"
                          aria-label={`Go to page ${page}`}
                          aria-current={page === currentPage ? 'page' : undefined}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        aria-label="Next page"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}

          {/* Bottom CTA */}
          <div className="text-center">
            <div className="bg-gradient-subtle rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Ready to Get Similar Results?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Let's discuss your project and create designs that don't just look great, but drive real business growth.
              </p>
              <Button 
                size="lg"
                className="bg-gradient-youtube hover:shadow-glow transition-all duration-300 font-semibold px-8 py-4"
                onClick={() => window.location.href = links.contact}
              >
                Start Your Project Today
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

import { useState, useEffect } from 'react'

export interface PublicPortfolioItem {
  id: number
  title: string
  description: string
  category: string
  image: string
  beforeImage?: string
  afterImage?: string
  clientName?: string
  results?: string
  featured?: boolean
  tags?: string[]
}

export function usePublicPortfolio(featured = false, limit = 4) {
  const [portfolio, setPortfolio] = useState<PublicPortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPortfolio = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const url = featured 
        ? `${baseUrl}/api/portfolio.php?featured=1&limit=${limit}`
        : `${baseUrl}/api/portfolio.php?limit=${limit}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setPortfolio(Array.isArray(data.data) ? data.data : [])
      } else {
        throw new Error(data.error || 'Failed to load portfolio')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio')
      console.error('Portfolio fetch error:', err)
      
      // Fallback to hardcoded portfolio if API fails
      setPortfolio([
        {
          id: 1,
          title: "YouTube Channel Rebrand",
          description: "Complete channel makeover for tech reviewer",
          category: "YouTube Branding",
          image: "/api/placeholder/400/300",
          clientName: "TechReview Pro",
          results: "300% increase in subscriber growth",
          featured: true,
          tags: ["branding", "youtube", "tech"]
        },
        {
          id: 2,
          title: "Startup Logo Design",
          description: "Modern logo for fintech startup",
          category: "Logo Design",
          image: "/api/placeholder/400/300",
          clientName: "FinanceFlow",
          results: "$2M funding round success",
          featured: true,
          tags: ["logo", "startup", "fintech"]
        },
        {
          id: 3,
          title: "Gaming Thumbnails Pack",
          description: "High-CTR thumbnails for gaming channel",
          category: "YouTube Thumbnails",
          image: "/api/placeholder/400/300",
          clientName: "GameMaster",
          results: "500% CTR improvement",
          featured: true,
          tags: ["thumbnails", "gaming", "youtube"]
        },
        {
          id: 4,
          title: "E-commerce Brand Identity",
          description: "Complete brand package for online store",
          category: "Brand Identity",
          image: "/api/placeholder/400/300",
          clientName: "StyleHub",
          results: "200% sales increase",
          featured: true,
          tags: ["branding", "ecommerce", "identity"]
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPortfolio()
  }, [featured, limit])

  return {
    portfolio,
    loading,
    error,
    refetch: fetchPortfolio
  }
}
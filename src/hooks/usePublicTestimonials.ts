import { useState, useEffect } from 'react'

export interface PublicTestimonial {
  id: number
  name: string
  role: string
  content: string
  rating: number
  avatar?: string
  featured?: boolean
  approved?: boolean
}

export function usePublicTestimonials(featured = false) {
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const url = featured 
        ? `${baseUrl}/api/testimonials.php?featured=1&approved=1&limit=3`
        : `${baseUrl}/api/testimonials.php?approved=1`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch testimonials')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setTestimonials(Array.isArray(data.data) ? data.data : [])
      } else {
        throw new Error(data.error || 'Failed to load testimonials')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch testimonials')
      console.error('Testimonials fetch error:', err)
      
      // Fallback to hardcoded testimonials if API fails
      setTestimonials([
        {
          id: 1,
          name: "Sarah Johnson",
          role: "YouTube Creator (2M+ Subscribers)",
          content: "Adil's thumbnails increased my CTR by 200%! My channel growth exploded after working with him. The designs are simply outstanding.",
          rating: 5,
          avatar: "/api/placeholder/80/80",
          featured: true
        },
        {
          id: 2,
          name: "Mike Rodriguez",
          role: "Tech Startup Founder",
          content: "The logo Adil designed became the face of our $10M startup. Professional, creative, and delivered exactly what we envisioned.",
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
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [featured])

  return {
    testimonials,
    loading,
    error,
    refetch: fetchTestimonials
  }
}
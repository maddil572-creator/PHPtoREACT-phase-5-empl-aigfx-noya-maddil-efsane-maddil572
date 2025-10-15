import { useState, useEffect } from 'react'

export interface ServiceVariation {
  name: string
  multiplier: number
}

export interface PricingService {
  name: string
  basePrice: number
  variations: ServiceVariation[]
}

export function usePricingServices() {
  const [services, setServices] = useState<PricingService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServices = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${baseUrl}/api/services.php`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Transform database services to pricing format
        const pricingServices = (Array.isArray(data.data) ? data.data : []).map((service: any) => ({
          name: service.name || service.title,
          basePrice: parseInt(service.base_price) || 99,
          variations: service.packages ? 
            JSON.parse(service.packages).map((pkg: any, index: number) => ({
              name: pkg.name,
              multiplier: index === 0 ? 1 : (index + 1) * 1.5 // Simple multiplier logic
            })) : [
              { name: "Basic", multiplier: 1 },
              { name: "Standard", multiplier: 2 },
              { name: "Premium", multiplier: 3 }
            ]
        }))
        
        setServices(pricingServices)
      } else {
        throw new Error(data.error || 'Failed to load services')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services')
      console.error('Pricing services fetch error:', err)
      
      // Fallback to hardcoded services if API fails
      setServices([
        {
          name: "YouTube Thumbnails",
          basePrice: 49,
          variations: [
            { name: "Single Thumbnail", multiplier: 1 },
            { name: "5 Thumbnail Pack", multiplier: 4 },
            { name: "10 Thumbnail Pack", multiplier: 7.5 },
            { name: "Monthly Retainer (20 thumbnails)", multiplier: 15 }
          ]
        },
        {
          name: "Logo Design",
          basePrice: 149,
          variations: [
            { name: "Logo Only", multiplier: 1 },
            { name: "Logo + Business Card", multiplier: 1.5 },
            { name: "Complete Brand Identity", multiplier: 3 },
            { name: "Multiple Logo Concepts", multiplier: 2 }
          ]
        },
        {
          name: "Video Editing",
          basePrice: 299,
          variations: [
            { name: "Basic Editing (up to 5 min)", multiplier: 1 },
            { name: "Standard Editing (up to 15 min)", multiplier: 2.5 },
            { name: "Premium Production (up to 60 min)", multiplier: 4.5 },
            { name: "YouTube Video Package", multiplier: 1.8 }
          ]
        },
        {
          name: "YouTube Channel Setup",
          basePrice: 399,
          variations: [
            { name: "Channel Starter", multiplier: 1 },
            { name: "Growth Package", multiplier: 2 },
            { name: "Complete Transformation", multiplier: 3.5 }
          ]
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  return {
    services,
    loading,
    error,
    refetch: fetchServices
  }
}
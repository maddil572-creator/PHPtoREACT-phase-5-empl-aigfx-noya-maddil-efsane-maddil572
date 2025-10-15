import { useState, useEffect } from 'react'

export interface HomepageContent {
  [key: string]: {
    value: string
    type: string
    order: number
    active: boolean
  }
}

export interface HomepageSections {
  [section: string]: HomepageContent
}

export function useHomepageContent() {
  const [content, setContent] = useState<HomepageSections>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContent = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/homepage.php`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch homepage content')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setContent(data.data || {})
      } else {
        throw new Error(data.error || 'Failed to load content')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch homepage content')
      console.error('Homepage content fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getContent = (section: string, key: string, fallback: string = ''): string => {
    return content[section]?.[key]?.value || fallback
  }

  const getSectionContent = (section: string): HomepageContent => {
    return content[section] || {}
  }

  useEffect(() => {
    fetchContent()
  }, [])

  return {
    content,
    loading,
    error,
    getContent,
    getSectionContent,
    refetch: fetchContent
  }
}
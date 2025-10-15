import { useState, useEffect } from 'react'
import { apiRequest } from '../utils/api'

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

export function useHomepage() {
  const [content, setContent] = useState<HomepageSections>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContent = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiRequest('/api/homepage.php')
      setContent(response.data || {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch homepage content')
    } finally {
      setLoading(false)
    }
  }

  const fetchSection = async (section: string) => {
    try {
      const response = await apiRequest(`/api/homepage.php/${section}`)
      setContent(prev => ({
        ...prev,
        [section]: response.data || {}
      }))
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch section content')
      throw err
    }
  }

  const updateContent = async (section: string, contentKey: string, value: string, type: string = 'text') => {
    try {
      await apiRequest(`/api/homepage.php/${section}/${contentKey}`, {
        method: 'PUT',
        body: JSON.stringify({
          content_value: value,
          content_type: type,
          is_active: 1
        })
      })
      
      // Update local state
      setContent(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [contentKey]: {
            value,
            type,
            order: prev[section]?.[contentKey]?.order || 0,
            active: true
          }
        }
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update content')
      throw err
    }
  }

  const createContent = async (section: string, contentKey: string, value: string, type: string = 'text') => {
    try {
      await apiRequest('/api/homepage.php', {
        method: 'POST',
        body: JSON.stringify({
          section,
          content_key: contentKey,
          content_value: value,
          content_type: type,
          is_active: 1
        })
      })
      
      // Update local state
      setContent(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [contentKey]: {
            value,
            type,
            order: 0,
            active: true
          }
        }
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create content')
      throw err
    }
  }

  const deleteContent = async (section: string, contentKey: string) => {
    try {
      await apiRequest(`/api/homepage.php/${section}/${contentKey}`, {
        method: 'DELETE'
      })
      
      // Update local state
      setContent(prev => {
        const newContent = { ...prev }
        if (newContent[section]) {
          delete newContent[section][contentKey]
        }
        return newContent
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete content')
      throw err
    }
  }

  useEffect(() => {
    fetchContent()
  }, [])

  return {
    content,
    loading,
    error,
    fetchContent,
    fetchSection,
    updateContent,
    createContent,
    deleteContent,
    refetch: fetchContent
  }
}
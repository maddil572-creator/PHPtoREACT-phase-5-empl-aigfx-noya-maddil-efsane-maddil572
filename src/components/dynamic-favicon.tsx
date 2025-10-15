import { useEffect } from 'react'
import { useSiteLinks } from '@/hooks/useSiteLinks'

export function DynamicFavicon() {
  const { siteSettings, loading } = useSiteLinks()

  useEffect(() => {
    if (!loading && siteSettings.favicon) {
      // Update favicon dynamically
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      if (favicon) {
        favicon.href = siteSettings.favicon
      } else {
        // Create favicon link if it doesn't exist
        const newFavicon = document.createElement('link')
        newFavicon.rel = 'icon'
        newFavicon.type = 'image/x-icon'
        newFavicon.href = siteSettings.favicon
        document.head.appendChild(newFavicon)
      }

      // Also update any other favicon variants
      const faviconSvg = document.querySelector('link[rel="icon"][type="image/svg+xml"]') as HTMLLinkElement
      if (faviconSvg) {
        faviconSvg.href = siteSettings.favicon
      }
    }
  }, [siteSettings.favicon, loading])

  return null // This component doesn't render anything visible
}
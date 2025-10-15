import { Helmet } from "react-helmet-async"
import { useHomepageContent } from "@/hooks/useHomepageContent"

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: string
}

export function SEOHead({
  title = "Adil GFX - Professional Logo Design, YouTube Thumbnails & Video Editing",
  description,
  keywords = "logo design, youtube thumbnails, video editing, brand identity, graphic design, youtube optimization, channel setup, adil gfx",
  image = "/api/placeholder/1200/630",
  url = "https://adilgfx.com",
  type = "website"
}: SEOHeadProps) {
  const { getContent, loading } = useHomepageContent()
  
  const defaultDescription = loading 
    ? "Transform your brand with premium logo design, high-converting YouTube thumbnails, and professional video editing. Trusted by 500+ clients worldwide. Get results in 24-48 hours."
    : getContent('global', 'site_description', 'Transform your brand with premium logo design, high-converting YouTube thumbnails, and professional video editing. Trusted by 500+ clients worldwide. Get results in 24-48 hours.')
  
  const finalDescription = description || defaultDescription
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Adil GFX" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Adil GFX" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={finalDescription} />
      <meta property="twitter:image" content={image} />

      {/* Additional SEO */}
      <meta name="theme-color" content="#FF0000" />
      <meta name="msapplication-TileColor" content="#FF0000" />
    </Helmet>
  )
}
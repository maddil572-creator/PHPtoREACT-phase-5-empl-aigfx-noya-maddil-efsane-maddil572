import { useHomepageContent } from './useHomepageContent'

export function useSiteLinks() {
  const { getContent, loading } = useHomepageContent()

  // Internal navigation links
  const links = {
    home: loading ? '/' : getContent('links', 'home_url', '/'),
    about: loading ? '/about' : getContent('links', 'about_url', '/about'),
    services: loading ? '/services' : getContent('links', 'services_url', '/services'),
    portfolio: loading ? '/portfolio' : getContent('links', 'portfolio_url', '/portfolio'),
    blog: loading ? '/blog' : getContent('links', 'blog_url', '/blog'),
    testimonials: loading ? '/testimonials' : getContent('links', 'testimonials_url', '/testimonials'),
    faq: loading ? '/faq' : getContent('links', 'faq_url', '/faq'),
    contact: loading ? '/contact' : getContent('links', 'contact_url', '/contact'),
    auth: loading ? '/auth' : getContent('links', 'auth_url', '/auth'),
    dashboard: loading ? '/dashboard' : getContent('links', 'dashboard_url', '/dashboard'),
    userDashboard: loading ? '/user/dashboard' : getContent('links', 'user_dashboard_url', '/user/dashboard'),
    userLogin: loading ? '/user/login' : getContent('links', 'user_login_url', '/user/login'),
  }

  // External links
  const externalLinks = {
    whatsapp: loading ? 'https://wa.me/1234567890' : getContent('external_links', 'whatsapp_url', 'https://wa.me/1234567890'),
    fiverr: loading ? 'https://fiverr.com/adilgfx' : getContent('external_links', 'fiverr_profile_url', 'https://fiverr.com/adilgfx'),
    upwork: loading ? 'https://upwork.com/freelancers/adilgfx' : getContent('external_links', 'upwork_profile_url', 'https://upwork.com/freelancers/adilgfx'),
    calendly: loading ? 'https://calendly.com/adilgfx' : getContent('external_links', 'calendly_url', 'https://calendly.com/adilgfx'),
  }

  // Site settings
  const siteSettings = {
    favicon: loading ? '/favicon.ico' : getContent('site_settings', 'favicon_url', '/favicon.ico'),
    siteUrl: loading ? 'https://adilgfx.com' : getContent('site_settings', 'site_url', 'https://adilgfx.com'),
    adminEmail: loading ? 'admin@adilgfx.com' : getContent('site_settings', 'admin_email', 'admin@adilgfx.com'),
  }

  return {
    links,
    externalLinks,
    siteSettings,
    loading
  }
}
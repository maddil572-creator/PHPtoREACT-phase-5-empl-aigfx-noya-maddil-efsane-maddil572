import { Mail, Phone, Youtube, Facebook, Instagram, Linkedin, ArrowUp } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useHomepageContent } from "@/hooks/useHomepageContent"
import { useSiteLinks } from "@/hooks/useSiteLinks"
import { useLayoutConfig, DEFAULT_FOOTER_CONFIG } from "@/hooks/useLayoutConfig"
import { cn } from "@/lib/utils"

export function Footer() {
  const { getContent, loading } = useHomepageContent()
  const { links, externalLinks } = useSiteLinks()
  const { footerConfig, footerMenuSections, loading: layoutLoading } = useLayoutConfig()
  
  // Use layout config with fallbacks
  const config = footerConfig || DEFAULT_FOOTER_CONFIG
  
  // Don't render footer if disabled
  if (!config.show_footer) {
    return null;
  }

  const footerLinks = {
    services: [
      { name: "Logo Design", href: `${links.services}#logo` },
      { name: "YouTube Thumbnails", href: `${links.services}#thumbnails` },
      { name: "Video Editing", href: `${links.services}#video` },
      { name: "YouTube Setup & Branding", href: `${links.services}#youtube-branding` }
    ],
    explore: [
      { name: "Portfolio", href: links.portfolio },
      { name: "Blog", href: links.blog },
      { name: "Testimonials", href: links.testimonials },
      { name: "Case Studies", href: `${links.testimonials}#case-studies` }
    ],
    support: [
      { name: "FAQ", href: links.faq },
      { name: "Contact", href: links.contact },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms & Conditions", href: "/terms" }
    ],
    business: [
      { name: "Hire Me (Direct)", href: links.contact },
      { name: "Fiverr Profile", href: externalLinks.fiverr },
      { name: "Media Kit (PDF)", href: "/media-kit.pdf" },
      { name: "Free Templates", href: "#lead-magnet" }
    ]
  }

  const socialLinks = [
    { 
      name: "Facebook", 
      href: loading ? "https://facebook.com/adilgfx" : getContent('social', 'facebook_url', 'https://facebook.com/adilgfx'), 
      icon: Facebook 
    },
    { 
      name: "Instagram", 
      href: loading ? "https://instagram.com/adilgfx" : getContent('social', 'instagram_url', 'https://instagram.com/adilgfx'), 
      icon: Instagram 
    },
    { 
      name: "LinkedIn", 
      href: loading ? "https://linkedin.com/in/adilgfx" : getContent('social', 'linkedin_url', 'https://linkedin.com/in/adilgfx'), 
      icon: Linkedin 
    }
  ]
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter section */}
      <div className="border-b border-primary-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                {loading ? 'Stay Updated' : getContent('footer', 'newsletter_title', 'Stay Updated')}
              </h3>
              <p className="text-primary-foreground/80">
                {loading 
                  ? 'Get free design tips, latest trends, and exclusive offers delivered to your inbox.'
                  : getContent('footer', 'newsletter_description', 'Get free design tips, latest trends, and exclusive offers delivered to your inbox.')
                }
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
              <Button className="bg-gradient-youtube hover:shadow-glow whitespace-nowrap">
                Subscribe Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link to={links.home} className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-youtube rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-xl">Adil GFX</span>
            </Link>
            <p className="text-primary-foreground/80 mb-6 text-sm">
              {loading 
                ? 'Professional designer helping brands and YouTubers grow through premium visual content.'
                : getContent('footer', 'company_description', 'Professional designer helping brands and YouTubers grow through premium visual content.')
              }
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-youtube-red transition-smooth"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-primary-foreground/80 hover:text-white text-sm transition-smooth"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <ul className="space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-primary-foreground/80 hover:text-white text-sm transition-smooth"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-primary-foreground/80 hover:text-white text-sm transition-smooth"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Business */}
          <div>
            <h4 className="font-semibold mb-4">Business</h4>
            <ul className="space-y-2">
              {footerLinks.business.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith('http') || link.href.startsWith('/') ? (
                    link.href.startsWith('http') ? (
                      <a 
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-foreground/80 hover:text-white text-sm transition-smooth"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link 
                        to={link.href}
                        className="text-primary-foreground/80 hover:text-white text-sm transition-smooth"
                      >
                        {link.name}
                      </Link>
                    )
                  ) : (
                    <a 
                      href={link.href}
                      className="text-primary-foreground/80 hover:text-white text-sm transition-smooth"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-foreground/80 text-sm">
              {loading 
                ? '© 2025 GFX by Adi. All rights reserved.'
                : getContent('footer', 'copyright_text', '© 2025 GFX by Adi. All rights reserved.')
              }
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a 
                href={`mailto:${loading ? 'hello@adilgfx.com' : getContent('footer', 'contact_email', 'hello@adilgfx.com')}`} 
                className="flex items-center space-x-2 text-primary-foreground/80 hover:text-white text-sm transition-smooth"
              >
                <Mail className="h-4 w-4" />
                <span>{loading ? 'hello@adilgfx.com' : getContent('footer', 'contact_email', 'hello@adilgfx.com')}</span>
              </a>
              <a 
                href={`https://wa.me/${loading ? '1234567890' : getContent('footer', 'whatsapp_number', '1234567890')}`} 
                className="flex items-center space-x-2 text-primary-foreground/80 hover:text-white text-sm transition-smooth"
              >
                <Phone className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
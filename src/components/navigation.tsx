import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X, Play, Palette, User, Phone, CircleHelp as HelpCircle, Briefcase, FileText, Star, LogIn, LogOut, LayoutDashboard, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useGlobalSettings } from "@/components/global-settings-provider"
import { useAuth } from "@/contexts/AuthContext"
import { useHomepageContent } from "@/hooks/useHomepageContent"
import { useSiteLinks } from "@/hooks/useSiteLinks"
import { useLayoutConfig, DEFAULT_HEADER_CONFIG } from "@/hooks/useLayoutConfig"
import { cn } from "@/lib/utils"

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const location = useLocation()
  const navigate = useNavigate()
  const { settings } = useGlobalSettings()
  const { isAuthenticated, user, logout, hasAnyRole } = useAuth()
  const { getContent, loading } = useHomepageContent()
  const { links } = useSiteLinks()
  const { headerConfig, headerMenuItems, loading: layoutLoading } = useLayoutConfig()
  
  // Use layout config with fallbacks
  const config = headerConfig || DEFAULT_HEADER_CONFIG

  const navigation = [
    { name: "Home", href: links.home, icon: Play },
    { name: "Portfolio", href: links.portfolio, icon: Palette },
    { name: "Services", href: links.services, icon: Briefcase },
    { name: "About", href: links.about, icon: User },
    { name: "Testimonials", href: links.testimonials, icon: Star },
    { name: "Blog", href: links.blog, icon: FileText },
    { name: "FAQ", href: links.faq, icon: HelpCircle },
    { name: "Contact", href: links.contact, icon: Phone },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Don't render header if disabled
  if (!config.show_header) {
    return null;
  }

  const headerClasses = cn(
    "top-0 left-0 right-0 z-50 border-b border-border",
    {
      "fixed": config.header_position === "fixed" || config.header_position === "sticky",
      "sticky": config.header_position === "sticky",
      "relative": config.header_position === "static",
      "bg-background/80 backdrop-blur-md": config.header_background === "transparent",
      "bg-background": config.header_background === "solid",
      "bg-gradient-to-r from-primary/10 to-secondary/10": config.header_background === "gradient",
    }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className={headerClasses} style={{ height: `${config.header_height}px` }}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to={links.home} 
            className="flex items-center space-x-2 font-bold text-xl text-foreground hover:text-youtube-red transition-smooth"
          >
            <div className="w-8 h-8 bg-gradient-youtube rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span>{loading ? (settings?.content?.siteTitle || 'Adil GFX') : getContent('navigation', 'logo_text', settings?.content?.siteTitle || 'Adil GFX')}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-smooth",
                    location.pathname === item.href
                      ? "text-youtube-red"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Desktop CTA & Theme Toggle */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Bar */}
            {config.show_search && (
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </form>
            )}
            
            {/* Additional Header Menu Items */}
            {headerMenuItems?.map((item, index) => (
              <Link key={index} to={item.url}>
                <Button 
                  variant={item.style === 'button' ? 'default' : item.style === 'highlight' ? 'secondary' : 'ghost'}
                  size="sm"
                  className={item.style === 'highlight' ? 'bg-gradient-youtube text-white hover:shadow-glow' : ''}
                >
                  {item.text}
                </Button>
              </Link>
            ))}
            
            {config.show_language_switcher && <LanguageSwitcher />}
            {config.show_theme_toggle && <ThemeToggle />}
            {isAuthenticated ? (
              <>
                {hasAnyRole(['admin', 'editor', 'viewer']) && (
                  <Link to={links.dashboard}>
                    <Button variant="outline" size="sm">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Link to={links.userDashboard}>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {user?.name}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to={links.userLogin}>
                  <Button variant="outline" size="sm">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link to={loading ? "/contact" : getContent('navigation', 'cta_button_link', '/contact')}>
                  <Button className="bg-gradient-youtube hover:shadow-glow transition-all duration-300 font-medium">
                    {loading ? (settings?.content?.headerCtaText || 'Hire Me Now') : getContent('navigation', 'cta_button_text', settings?.content?.headerCtaText || 'Hire Me Now')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-10 w-10 px-0"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-border mt-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-smooth",
                    location.pathname === item.href
                      ? "text-youtube-red bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
            <div className="pt-4 px-4 space-y-2">
              {isAuthenticated ? (
                <>
                  {hasAnyRole(['admin', 'editor', 'viewer']) && (
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  <Link to="/user/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      <User className="h-4 w-4 mr-2" />
                      {user?.name}
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/user/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link to={loading ? "/contact" : getContent('navigation', 'cta_button_link', '/contact')} onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-youtube hover:shadow-glow transition-all duration-300 font-medium">
                      {loading ? (settings?.content?.headerCtaText || 'Hire Me Now') : getContent('navigation', 'cta_button_text', settings?.content?.headerCtaText || 'Hire Me Now')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
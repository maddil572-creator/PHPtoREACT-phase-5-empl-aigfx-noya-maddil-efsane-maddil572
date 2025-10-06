import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X, Play, Palette, User, Phone, CircleHelp as HelpCircle, Briefcase, FileText, Star, LogIn, LogOut, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useGlobalSettings } from "@/components/global-settings-provider"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/", icon: Play },
  { name: "Portfolio", href: "/portfolio", icon: Palette },
  { name: "Services", href: "/services", icon: Briefcase },
  { name: "About", href: "/about", icon: User },
  { name: "Testimonials", href: "/testimonials", icon: Star },
  { name: "Blog", href: "/blog", icon: FileText },
  { name: "FAQ", href: "/faq", icon: HelpCircle },
  { name: "Contact", href: "/contact", icon: Phone },
]

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { settings } = useGlobalSettings()
  const { isAuthenticated, user, logout, hasAnyRole } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 font-bold text-xl text-foreground hover:text-youtube-red transition-smooth"
          >
            <div className="w-8 h-8 bg-gradient-youtube rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span>{settings?.content?.siteTitle || 'Adil GFX'}</span>
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
            <LanguageSwitcher />
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                {hasAnyRole(['admin', 'editor', 'viewer']) && (
                  <Link to="/dashboard">
                    <Button variant="outline" size="sm">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Link to="/user/dashboard">
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
                <Link to="/user/login">
                  <Button variant="outline" size="sm">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button className="bg-gradient-youtube hover:shadow-glow transition-all duration-300 font-medium">
                    {settings?.content?.headerCtaText || 'Hire Me Now'}
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
                  <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-youtube hover:shadow-glow transition-all duration-300 font-medium">
                      {settings?.content?.headerCtaText || 'Hire Me Now'}
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
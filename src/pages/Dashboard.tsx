import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { fetchUserData, type UserData } from "@/utils/api"
import { 
  Coins, Flame, Users, Gift, Trophy, Copy, 
  ArrowUpRight, ArrowDownRight, CheckCircle, Clock,
  LogOut, Settings as SettingsIcon, Home, FileText,
  Image, MessageSquare, Star, Users as UsersIcon,
  Palette, Globe, BarChart3
} from "lucide-react"
import { SEOHead } from "@/components/seo-head"
import { HomepageManager } from "@/admin/pages/Homepage"
import { BlogList } from "@/admin/pages/Blogs"
import { PortfolioGrid } from "@/admin/pages/Portfolio"
import { ServiceList } from "@/admin/pages/Services"
import { TestimonialList } from "@/admin/pages/Testimonials"
import { UserList } from "@/admin/pages/Users"
import { MediaLibrary } from "@/admin/pages/Media"
import { SettingsForm } from "@/admin/pages/Settings"
import { AnalyticsOverview } from "@/admin/pages/Analytics"

export default function Dashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check authentication
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      navigate('/auth')
      return
    }

    // Check if user is admin
    const userRole = localStorage.getItem('userRole')
    setIsAdmin(userRole === 'admin')

    // Load user data
    loadUserData()
  }, [navigate])

  const loadUserData = async () => {
    try {
      const data = await fetchUserData()
      setUserData(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userName')
    toast({
      title: "Logged out",
      description: "You've been successfully logged out",
    })
    navigate('/')
  }

  const copyReferralLink = () => {
    if (userData?.referrals.referralLink) {
      navigator.clipboard.writeText(userData.referrals.referralLink)
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      })
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </main>
    )
  }

  if (!userData) {
    return (
      <main className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Failed to load dashboard</h2>
          <Button onClick={() => navigate('/auth')}>Return to Login</Button>
        </div>
      </main>
    )
  }

  const streakProgress = (userData.streak.current / userData.streak.nextMilestone) * 100

  // If user is admin, show admin dashboard
  if (isAdmin) {
    return (
      <>
        <SEOHead 
          title="Admin Dashboard - Adil GFX"
          description="Manage website content, users, and settings"
          url="https://adilgfx.com/dashboard"
        />
        <main className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Admin Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Manage your website content and settings
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="/" target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    View Site
                  </a>
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>

            {/* Admin Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="homepage" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Homepage</span>
                </TabsTrigger>
                <TabsTrigger value="blogs" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Blogs</span>
                </TabsTrigger>
                <TabsTrigger value="portfolio" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  <span className="hidden sm:inline">Portfolio</span>
                </TabsTrigger>
                <TabsTrigger value="services" className="flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Services</span>
                </TabsTrigger>
                <TabsTrigger value="testimonials" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span className="hidden sm:inline">Reviews</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Users</span>
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  <span className="hidden sm:inline">Media</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <AnalyticsOverview />
              </TabsContent>

              <TabsContent value="homepage">
                <HomepageManager />
              </TabsContent>

              <TabsContent value="blogs">
                <BlogList />
              </TabsContent>

              <TabsContent value="portfolio">
                <PortfolioGrid />
              </TabsContent>

              <TabsContent value="services">
                <ServiceList />
              </TabsContent>

              <TabsContent value="testimonials">
                <TestimonialList />
              </TabsContent>

              <TabsContent value="users">
                <UserList />
              </TabsContent>

              <TabsContent value="media">
                <MediaLibrary />
              </TabsContent>

              <TabsContent value="settings">
                <SettingsForm />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </>
    )
  }

  // Regular user dashboard
  return (
    <>
      <SEOHead 
        title="Dashboard - Adil GFX"
        description="Manage your projects, track rewards, and access exclusive design resources"
        url="https://adilgfx.com/dashboard"
      />
      <main className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, <span className="text-gradient-youtube">{userData?.user?.name || 'User'}</span>!
              </h1>
              <p className="text-muted-foreground">
                {userData?.user?.membershipTier || 'Free'} Member since {userData?.user?.joinDate ? new Date(userData.user.joinDate).toLocaleDateString() : 'Recently'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <SettingsIcon className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Token Balance */}
            <Card className="card-premium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Token Balance</CardTitle>
                <Coins className="h-5 w-5 text-youtube-red" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gradient-youtube mb-2">
                  {userData.tokens.balance}
                </div>
                <p className="text-xs text-muted-foreground">
                  {userData.tokens.totalEarned} earned · {Math.abs(userData.tokens.totalSpent)} spent
                </p>
              </CardContent>
            </Card>

            {/* Login Streak */}
            <Card className="card-premium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Login Streak</CardTitle>
                <Flame className="h-5 w-5 text-youtube-red" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-2">
                  {userData.streak.current} days
                </div>
                <Progress value={streakProgress} className="mb-2" />
                <p className="text-xs text-muted-foreground">
                  {userData.streak.nextMilestone - userData.streak.current} days until next reward
                </p>
              </CardContent>
            </Card>

            {/* Referrals */}
            <Card className="card-premium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Referrals</CardTitle>
                <Users className="h-5 w-5 text-youtube-red" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-2">
                  {userData.referrals.successfulConversions}
                </div>
                <p className="text-xs text-muted-foreground">
                  {userData.referrals.earningsFromReferrals} tokens earned
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="tokens">Token History</TabsTrigger>
              <TabsTrigger value="referrals">Referrals</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Orders</CardTitle>
                  <CardDescription>Track your project progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userData.orders.map((order) => (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{order.service}</h4>
                          <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                            {order.status === 'completed' ? (
                              <><CheckCircle className="h-3 w-3 mr-1" /> Completed</>
                            ) : (
                              <><Clock className="h-3 w-3 mr-1" /> In Progress</>
                            )}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{order.package}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ordered: {new Date(order.orderDate).toLocaleDateString()}
                          {order.completionDate && ` • Completed: ${new Date(order.completionDate).toLocaleDateString()}`}
                          {order.expectedCompletion && ` • Expected: ${new Date(order.expectedCompletion).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-foreground">${order.amount}</div>
                        <Button size="sm" variant="outline" className="mt-2">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Token History Tab */}
            <TabsContent value="tokens" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Token History</CardTitle>
                  <CardDescription>Your earning and spending activity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {userData.tokens.history.map((txn) => (
                    <div 
                      key={txn.id} 
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${txn.type === 'earned' ? 'bg-success/10' : 'bg-muted'}`}>
                          {txn.type === 'earned' ? (
                            <ArrowUpRight className="h-4 w-4 text-success" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{txn.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(txn.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`font-bold ${txn.type === 'earned' ? 'text-success' : 'text-foreground'}`}>
                        {txn.type === 'earned' ? '+' : ''}{txn.amount}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Referrals Tab */}
            <TabsContent value="referrals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Refer Friends & Earn</CardTitle>
                  <CardDescription>
                    Share your referral link and earn 100 tokens for each friend who signs up!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-gradient-subtle rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Your Referral Link</Label>
                      <Button size="sm" variant="outline" onClick={copyReferralLink}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <div className="p-3 bg-background border rounded-lg font-mono text-sm break-all">
                      {userData.referrals.referralLink}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {userData.referrals.totalReferred}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Referrals</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {userData.referrals.successfulConversions}
                      </div>
                      <div className="text-xs text-muted-foreground">Conversions</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-gradient-youtube mb-1">
                        {userData.referrals.earningsFromReferrals}
                      </div>
                      <div className="text-xs text-muted-foreground">Tokens Earned</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>Track your milestones and unlock rewards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userData.achievements.map((achievement) => (
                      <div 
                        key={achievement.id} 
                        className={`p-4 border rounded-lg ${achievement.unlocked ? 'bg-gradient-subtle' : 'opacity-60'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-3 rounded-full ${achievement.unlocked ? 'bg-youtube-red/10' : 'bg-muted'}`}>
                            <Trophy className={`h-5 w-5 ${achievement.unlocked ? 'text-youtube-red' : 'text-muted-foreground'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-foreground">{achievement.name}</h4>
                              {achievement.unlocked && (
                                <CheckCircle className="h-4 w-4 text-success" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {achievement.description}
                            </p>
                            {!achievement.unlocked && achievement.progress !== undefined && (
                              <Progress 
                                value={(achievement.progress / (achievement.target || 1)) * 100} 
                                className="h-2"
                              />
                            )}
                            {achievement.unlocked && achievement.date && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Unlocked: {new Date(achievement.date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  )
}

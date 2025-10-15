import { Clock, Zap, Trophy, Heart, Star, Users, Award, CheckCircle } from "lucide-react"
import { useHomepageContent } from "@/hooks/useHomepageContent"

// Icon mapping
const iconMap = {
  Zap,
  Trophy,
  Star,
  Users,
  Heart,
  Award,
  Clock
}

export function WhyChooseSection() {
  const { getContent, loading } = useHomepageContent()

  // Generate dynamic reasons from database content
  const reasons = loading ? [
    {
      icon: Zap,
      title: "Lightning Fast Delivery",
      description: "Most projects delivered within 24-48 hours without compromising quality",
      stat: "24-48h",
      color: "text-yellow-500"
    },
    {
      icon: Trophy,
      title: "Proven Results",
      description: "Designs that have generated millions in revenue and boosted client success",
      stat: "500+ Projects",
      color: "text-youtube-red"
    },
    {
      icon: Star,
      title: "5-Star Rating",
      description: "Consistently rated 5 stars across all platforms - Fiverr, Upwork, and direct clients",
      stat: "5.0/5.0",
      color: "text-yellow-500"
    },
    {
      icon: Users,
      title: "Global Experience",
      description: "Worked with clients from 50+ countries, understanding diverse market needs",
      stat: "50+ Countries",
      color: "text-blue-500"
    },
    {
      icon: Heart,
      title: "Unlimited Revisions",
      description: "Your satisfaction is guaranteed - we'll revise until you're 100% happy",
      stat: "∞ Revisions",
      color: "text-pink-500"
    },
    {
      icon: Award,
      title: "Industry Expertise",
      description: "Specialized knowledge in YouTube optimization, branding, and conversion design",
      stat: "5+ Years",
      color: "text-purple-500"
    }
  ] : [1, 2, 3, 4, 5, 6].map(num => {
    const iconName = getContent('why_choose_reasons', `reason_${num}_icon`, 'Zap')
    return {
      icon: iconMap[iconName as keyof typeof iconMap] || Zap,
      title: getContent('why_choose_reasons', `reason_${num}_title`, 'Feature Title'),
      description: getContent('why_choose_reasons', `reason_${num}_description`, 'Feature description'),
      stat: getContent('why_choose_reasons', `reason_${num}_stat`, 'Stat'),
      color: getContent('why_choose_reasons', `reason_${num}_color`, 'text-gray-500')
    }
  })

  const achievements = [
    {
      number: loading ? "500+" : getContent('why_choose', 'achievement_1_number', '500+'),
      label: loading ? "Happy Clients" : getContent('why_choose', 'achievement_1_label', 'Happy Clients'),
      description: loading ? "Worldwide" : getContent('why_choose', 'achievement_1_description', 'Worldwide')
    },
    {
      number: loading ? "10M+" : getContent('why_choose', 'achievement_2_number', '10M+'),
      label: loading ? "Views Generated" : getContent('why_choose', 'achievement_2_label', 'Views Generated'),
      description: loading ? "For YouTube clients" : getContent('why_choose', 'achievement_2_description', 'For YouTube clients')
    },
    {
      number: loading ? "$50M+" : getContent('why_choose', 'achievement_3_number', '$50M+'),
      label: loading ? "Revenue Impact" : getContent('why_choose', 'achievement_3_label', 'Revenue Impact'),
      description: loading ? "Client success stories" : getContent('why_choose', 'achievement_3_description', 'Client success stories')
    },
    {
      number: loading ? "24h" : getContent('why_choose', 'achievement_4_number', '24h'),
      label: loading ? "Average Delivery" : getContent('why_choose', 'achievement_4_label', 'Average Delivery'),
      description: loading ? "For standard projects" : getContent('why_choose', 'achievement_4_description', 'For standard projects')
    }
  ]
  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {loading ? (
              <>Why Choose <span className="text-gradient-youtube">Adil</span>?</>
            ) : (
              <span dangerouslySetInnerHTML={{ 
                __html: getContent('why_choose', 'section_title', 'Why Choose Adil?').replace('Adil', '<span class="text-gradient-youtube">Adil</span>')
              }} />
            )}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {loading 
              ? "Trusted by 500+ businesses and creators worldwide. Here's what sets me apart from the competition."
              : getContent('why_choose', 'section_subtitle', "Trusted by 500+ businesses and creators worldwide. Here's what sets me apart from the competition.")
            }
          </p>
        </div>

        {/* Achievements grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {achievements.map((achievement, index) => (
            <div key={index} className="text-center card-premium">
              <div className="text-3xl md:text-4xl font-bold text-youtube-red mb-2">
                {achievement.number}
              </div>
              <div className="font-semibold text-foreground mb-1">
                {achievement.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {achievement.description}
              </div>
            </div>
          ))}
        </div>

        {/* Reasons grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {reasons.map((reason, index) => {
            const Icon = reason.icon
            return (
              <div key={index} className="card-premium text-center group hover:border-youtube-red/30 transition-all duration-300">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-small group-hover:shadow-premium transition-all duration-300`}>
                  <Icon className={`h-8 w-8 ${reason.color}`} />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {reason.title}
                </h3>
                
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {reason.description}
                </p>
                
                <div className="bg-gradient-youtube/10 text-youtube-red px-4 py-2 rounded-lg inline-flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-semibold text-sm">{reason.stat}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Trust indicators */}
        <div className="bg-gradient-subtle rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-6">
            Trusted Across <span className="text-gradient-youtube">All Platforms</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="space-y-2">
              <div className="flex justify-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                ))}
              </div>
              <div className="font-semibold text-foreground">Fiverr Level 2 Seller</div>
              <div className="text-sm text-muted-foreground">200+ Reviews • 5.0 Rating</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                ))}
              </div>
              <div className="font-semibold text-foreground">Upwork Top Rated</div>
              <div className="text-sm text-muted-foreground">100+ Projects • 100% Success</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                ))}
              </div>
              <div className="font-semibold text-foreground">Direct Clients</div>
              <div className="text-sm text-muted-foreground">200+ Projects • Long-term Partnerships</div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {loading 
                ? "Join hundreds of satisfied clients who've seen real results. Your success is my success."
                : getContent('global', 'why_choose_closing_text', "Join hundreds of satisfied clients who've seen real results. Your success is my success.")
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Money-back guarantee</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Copyright included</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
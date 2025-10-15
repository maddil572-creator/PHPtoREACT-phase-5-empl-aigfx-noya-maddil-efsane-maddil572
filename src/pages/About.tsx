import { Award, Users, Clock, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SEOHead } from "@/components/seo-head"
import { useHomepageContent } from "@/hooks/useHomepageContent"

const tools = [
  { name: "Adobe Photoshop", level: "Expert", years: "8+" },
  { name: "Adobe Illustrator", level: "Expert", years: "7+" },
  { name: "Adobe Premiere Pro", level: "Advanced", years: "6+" },
  { name: "After Effects", level: "Advanced", years: "5+" },
  { name: "Figma", level: "Advanced", years: "4+" },
  { name: "AI Tools (MidJourney, etc.)", level: "Advanced", years: "2+" }
]

// Icon mapping
const iconMap = {
  Users,
  Clock,
  Award,
  Zap
}

export default function About() {
  const { getContent, loading } = useHomepageContent()

  // Generate dynamic achievements from database content
  const achievements = loading ? [
    { icon: Users, value: "500+", label: "Happy Clients" },
    { icon: Clock, value: "24-48h", label: "Average Delivery" },
    { icon: Award, value: "5.0★", label: "Average Rating" },
    { icon: Zap, value: "99%", label: "Client Retention" }
  ] : [1, 2, 3, 4].map(num => {
    const iconName = getContent('about_stats', `stat_${num}_icon`, 'Users')
    return {
      icon: iconMap[iconName as keyof typeof iconMap] || Users,
      value: getContent('about_stats', `stat_${num}_value`, '0'),
      label: getContent('about_stats', `stat_${num}_label`, 'Stat')
    }
  })
  return (
    <>
      <SEOHead
        title="About Adil - Professional Designer & YouTube Expert | Adil GFX"
        description="Meet Adil, a professional designer specializing in logo design, YouTube thumbnails, and video editing. 500+ happy clients, 5-star rating, 24-48h delivery."
        keywords="about adil gfx, professional designer, youtube expert, logo designer, thumbnail designer"
        url="https://adilgfx.com/about"
      />
      <main className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Hi, I'm <span className="text-gradient-youtube">Adil</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              A passionate designer and video editor with over 8 years of experience helping brands and YouTubers 
              transform their visual identity and grow their audience through premium design.
            </p>
            <p className="text-muted-foreground mb-8">
              I've worked with everyone from individual creators to Fortune 500 companies, creating designs that 
              don't just look amazing—they drive real business results. My focus is on understanding your vision 
              and translating it into designs that convert viewers into loyal customers.
            </p>
            <Button 
              size="lg"
              className="bg-gradient-youtube hover:shadow-glow transition-all duration-300 font-semibold px-8 py-4"
            >
              Let's Work Together
            </Button>
          </div>
          
          <div className="relative">
            <div className="aspect-square bg-gradient-subtle rounded-2xl flex items-center justify-center">
              <div className="w-full h-full bg-muted rounded-2xl flex items-center justify-center">
                <span className="text-6xl">👨‍🎨</span>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {achievements.map((achievement) => {
            const Icon = achievement.icon
            return (
              <div key={achievement.label} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-youtube rounded-xl mb-4">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{achievement.value}</div>
                <div className="text-muted-foreground">{achievement.label}</div>
              </div>
            )
          })}
        </div>

        {/* My Story */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">My Story</h2>
          <div className="max-w-4xl mx-auto">
            <div className="card-premium">
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p className="mb-6">
                  My journey started 8 years ago when I created my first logo for a local business. That simple design 
                  helped them increase their customer base by 50% in just 3 months. That's when I realized the true 
                  power of great design—it's not just about making things look pretty, it's about driving real business results.
                </p>
                <p className="mb-6">
                  {loading 
                    ? "Since then, I've helped over 500 clients across various industries, from YouTubers who've gained millions"
                    : getContent('global', 'about_intro_text', "Since then, I've helped over 500 clients across various industries, from YouTubers who've gained millions of subscribers to startups that secured major funding rounds.")
                  } 
                  of subscribers to startups that have raised millions in funding. Each project teaches me something new, 
                  and I bring that accumulated knowledge to every new client.
                </p>
                <p>
                  My approach is simple: understand your goals, know your audience, and create designs that not only 
                  capture attention but also drive action. Whether it's a logo that builds trust, a thumbnail that 
                  increases click-through rates, or a video that converts viewers into customers, every design decision 
                  is made with your success in mind.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tools & Skills */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Tools & Expertise</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <div key={tool.name} className="card-premium">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">{tool.name}</h3>
                  <span className="text-sm text-youtube-red font-medium">{tool.years}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{tool.level}</span>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < (tool.level === 'Expert' ? 5 : 4) 
                            ? 'bg-youtube-red' 
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">What I Believe In</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-youtube rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Results-Driven Design</h3>
              <p className="text-muted-foreground">
                Every design decision is made with your business goals in mind. Beautiful design is worthless if it doesn't drive results.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-youtube rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Fast & Reliable</h3>
              <p className="text-muted-foreground">
                Your time is valuable. I deliver high-quality work quickly without compromising on excellence.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-youtube rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">True Partnership</h3>
              <p className="text-muted-foreground">
                I don't just deliver designs—I become your creative partner, invested in your long-term success.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-subtle rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ready to Transform Your Brand?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Let's discuss your vision and create designs that not only look amazing but drive real business growth.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                className="bg-gradient-youtube hover:shadow-glow transition-all duration-300 font-semibold px-8 py-4"
              >
                Start Your Project
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-youtube-red text-youtube-red hover:bg-youtube-red hover:text-white font-semibold px-8 py-4 transition-smooth"
              >
                Schedule a Call
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  )
}
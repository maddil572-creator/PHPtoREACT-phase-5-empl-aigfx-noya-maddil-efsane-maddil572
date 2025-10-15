import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useHomepage } from '../../hooks/useHomepage'
import { Loader2, Save, Eye, EyeOff, Plus, Trash2 } from 'lucide-react'

export function HomepageManager() {
  const { content, loading, error, updateContent, createContent, deleteContent } = useHomepage()
  const { toast } = useToast()
  const [saving, setSaving] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('hero')

  const handleSave = async (section: string, key: string, value: string, type: string = 'text') => {
    setSaving(`${section}.${key}`)
    try {
      await updateContent(section, key, value, type)
      toast({
        title: 'Success',
        description: 'Content updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update content',
        variant: 'destructive',
      })
    } finally {
      setSaving(null)
    }
  }

  const ContentField = ({ 
    section, 
    contentKey, 
    label, 
    type = 'text',
    placeholder = '',
    description = ''
  }: {
    section: string
    contentKey: string
    label: string
    type?: string
    placeholder?: string
    description?: string
  }) => {
    const currentValue = content[section]?.[contentKey]?.value || ''
    const [localValue, setLocalValue] = useState(currentValue)
    const isLoading = saving === `${section}.${contentKey}`

    const handleSaveField = () => {
      if (localValue !== currentValue) {
        handleSave(section, contentKey, localValue, type)
      }
    }

    const InputComponent = type === 'textarea' ? Textarea : Input

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={`${section}-${contentKey}`}>{label}</Label>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {type}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveField}
              disabled={isLoading || localValue === currentValue}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Save className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
        <InputComponent
          id={`${section}-${contentKey}`}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          rows={type === 'textarea' ? 3 : undefined}
        />
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Homepage Content Manager</h1>
          <p className="text-muted-foreground">
            Edit all homepage content from one central location
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Eye className="h-4 w-4 mr-2" />
            Preview Site
          </a>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="why_choose">Why Choose</TabsTrigger>
          <TabsTrigger value="why_choose_reasons">Reasons</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="global">Global Content</TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section Content</CardTitle>
              <CardDescription>
                Main headline, subtitle, and call-to-action buttons
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ContentField
                  section="hero"
                  contentKey="badge_text"
                  label="Trust Badge Text"
                  placeholder="Trusted by 500+ YouTubers & Brands"
                />
                <ContentField
                  section="hero"
                  contentKey="main_headline"
                  label="Main Headline"
                  placeholder="Transform Your Brand with Premium Designs"
                />
              </div>
              
              <ContentField
                section="hero"
                contentKey="subtitle"
                label="Subtitle"
                type="textarea"
                placeholder="Professional logo design, YouTube thumbnails..."
                description="This appears below the main headline"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ContentField
                  section="hero"
                  contentKey="cta_primary_text"
                  label="Primary CTA Text"
                  placeholder="Start Your Project"
                />
                <ContentField
                  section="hero"
                  contentKey="cta_secondary_text"
                  label="Secondary CTA Text"
                  placeholder="Watch My Intro"
                />
                <ContentField
                  section="hero"
                  contentKey="cta_tertiary_text"
                  label="Tertiary CTA Text"
                  placeholder="Watch Portfolio"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ContentField
                  section="hero"
                  contentKey="cta_primary_link"
                  label="Primary CTA Link"
                  placeholder="/contact"
                />
                <ContentField
                  section="hero"
                  contentKey="cta_secondary_link"
                  label="Secondary CTA Link"
                  placeholder="/about"
                />
                <ContentField
                  section="hero"
                  contentKey="cta_tertiary_link"
                  label="Tertiary CTA Link"
                  placeholder="/portfolio"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trust Indicators</CardTitle>
              <CardDescription>
                Statistics displayed below the hero section
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <ContentField
                    section="hero"
                    contentKey="stat_clients"
                    label="Clients Count"
                    placeholder="500+"
                  />
                  <ContentField
                    section="hero"
                    contentKey="stat_clients_label"
                    label="Clients Label"
                    placeholder="Happy Clients"
                  />
                </div>
                <div className="space-y-2">
                  <ContentField
                    section="hero"
                    contentKey="stat_delivery"
                    label="Delivery Time"
                    placeholder="24-48h"
                  />
                  <ContentField
                    section="hero"
                    contentKey="stat_delivery_label"
                    label="Delivery Label"
                    placeholder="Delivery Time"
                  />
                </div>
                <div className="space-y-2">
                  <ContentField
                    section="hero"
                    contentKey="stat_satisfaction"
                    label="Satisfaction Rate"
                    placeholder="99%"
                  />
                  <ContentField
                    section="hero"
                    contentKey="stat_satisfaction_label"
                    label="Satisfaction Label"
                    placeholder="Satisfaction Rate"
                  />
                </div>
                <div className="space-y-2">
                  <ContentField
                    section="hero"
                    contentKey="stat_rating"
                    label="Rating"
                    placeholder="5.0★"
                  />
                  <ContentField
                    section="hero"
                    contentKey="stat_rating_label"
                    label="Rating Label"
                    placeholder="Average Rating"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Why Choose Section */}
        <TabsContent value="why_choose" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Why Choose Section</CardTitle>
              <CardDescription>
                Section title, subtitle, and achievement statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ContentField
                  section="why_choose"
                  contentKey="section_title"
                  label="Section Title"
                  placeholder="Why Choose Adil?"
                />
                <ContentField
                  section="why_choose"
                  contentKey="section_subtitle"
                  label="Section Subtitle"
                  type="textarea"
                  placeholder="Trusted by 500+ businesses and creators worldwide..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((num) => (
                  <Card key={num} className="p-4">
                    <h4 className="font-medium mb-3">Achievement {num}</h4>
                    <div className="space-y-2">
                      <ContentField
                        section="why_choose"
                        contentKey={`achievement_${num}_number`}
                        label="Number"
                        placeholder={num === 1 ? "500+" : num === 2 ? "10M+" : num === 3 ? "$50M+" : "24h"}
                      />
                      <ContentField
                        section="why_choose"
                        contentKey={`achievement_${num}_label`}
                        label="Label"
                        placeholder={num === 1 ? "Happy Clients" : num === 2 ? "Views Generated" : num === 3 ? "Revenue Impact" : "Average Delivery"}
                      />
                      <ContentField
                        section="why_choose"
                        contentKey={`achievement_${num}_description`}
                        label="Description"
                        placeholder={num === 1 ? "Worldwide" : num === 2 ? "For YouTube clients" : num === 3 ? "Client success stories" : "For standard projects"}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Why Choose Reasons Section */}
        <TabsContent value="why_choose_reasons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Why Choose Reasons</CardTitle>
              <CardDescription>
                Manage the 6 reason cards displayed in the Why Choose section
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <Card key={num} className="p-4">
                    <h4 className="font-medium mb-4">Reason {num}</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <ContentField
                          section="why_choose_reasons"
                          contentKey={`reason_${num}_title`}
                          label="Title"
                          placeholder={num === 1 ? "Lightning Fast Delivery" : num === 2 ? "Proven Results" : "Feature Title"}
                        />
                        <ContentField
                          section="why_choose_reasons"
                          contentKey={`reason_${num}_stat`}
                          label="Statistic"
                          placeholder={num === 1 ? "24-48h" : num === 2 ? "500+ Projects" : "Stat"}
                        />
                      </div>
                      <ContentField
                        section="why_choose_reasons"
                        contentKey={`reason_${num}_description`}
                        label="Description"
                        type="textarea"
                        placeholder="Describe this feature or benefit..."
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <ContentField
                          section="why_choose_reasons"
                          contentKey={`reason_${num}_icon`}
                          label="Icon Name"
                          placeholder="Zap, Trophy, Star, Users, Heart, Award"
                          description="Available icons: Zap, Trophy, Star, Users, Heart, Award, Clock"
                        />
                        <ContentField
                          section="why_choose_reasons"
                          contentKey={`reason_${num}_color`}
                          label="Color Class"
                          placeholder="text-yellow-500"
                          description="Tailwind color classes like text-blue-500, text-red-500"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Section */}
        <TabsContent value="footer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Footer Content</CardTitle>
              <CardDescription>
                Newsletter section, company description, and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ContentField
                  section="footer"
                  contentKey="newsletter_title"
                  label="Newsletter Title"
                  placeholder="Stay Updated"
                />
                <ContentField
                  section="footer"
                  contentKey="newsletter_description"
                  label="Newsletter Description"
                  type="textarea"
                  placeholder="Get free design tips, latest trends..."
                />
              </div>

              <ContentField
                section="footer"
                contentKey="company_description"
                label="Company Description"
                type="textarea"
                placeholder="Professional designer helping brands and YouTubers..."
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ContentField
                  section="footer"
                  contentKey="contact_email"
                  label="Contact Email"
                  type="email"
                  placeholder="hello@adilgfx.com"
                />
                <ContentField
                  section="footer"
                  contentKey="whatsapp_number"
                  label="WhatsApp Number"
                  placeholder="1234567890"
                />
                <ContentField
                  section="footer"
                  contentKey="copyright_text"
                  label="Copyright Text"
                  placeholder="© 2025 GFX by Adi. All rights reserved."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Links */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>
                Manage all social media profile URLs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ContentField
                  section="social"
                  contentKey="facebook_url"
                  label="Facebook URL"
                  type="url"
                  placeholder="https://facebook.com/adilgfx"
                />
                <ContentField
                  section="social"
                  contentKey="instagram_url"
                  label="Instagram URL"
                  type="url"
                  placeholder="https://instagram.com/adilgfx"
                />
                <ContentField
                  section="social"
                  contentKey="linkedin_url"
                  label="LinkedIn URL"
                  type="url"
                  placeholder="https://linkedin.com/in/adilgfx"
                />
                <ContentField
                  section="social"
                  contentKey="youtube_url"
                  label="YouTube URL"
                  type="url"
                  placeholder="https://youtube.com/@adilgfx"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Navigation */}
        <TabsContent value="navigation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Navigation Settings</CardTitle>
              <CardDescription>
                Logo text and main CTA button
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ContentField
                  section="navigation"
                  contentKey="logo_text"
                  label="Logo Text"
                  placeholder="Adil GFX"
                />
                <ContentField
                  section="navigation"
                  contentKey="cta_button_text"
                  label="CTA Button Text"
                  placeholder="Hire Me Now"
                />
                <ContentField
                  section="navigation"
                  contentKey="cta_button_link"
                  label="CTA Button Link"
                  placeholder="/contact"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Global Content */}
        <TabsContent value="global" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Content</CardTitle>
              <CardDescription>
                Manage site-wide content used across multiple pages and components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ContentField
                section="global"
                contentKey="site_description"
                label="Default Site Description"
                type="textarea"
                placeholder="Transform your brand with premium logo design..."
                description="Used as default meta description across the site"
              />
              
              <ContentField
                section="global"
                contentKey="auth_page_subtitle"
                label="Auth Page Subtitle"
                placeholder="Join thousands of satisfied clients"
                description="Subtitle text on login/register pages"
              />
              
              <ContentField
                section="global"
                contentKey="about_intro_text"
                label="About Page Intro Text"
                type="textarea"
                placeholder="Since then, I've helped over 500 clients..."
                description="Introduction text on the About page"
              />
              
              <ContentField
                section="global"
                contentKey="why_choose_closing_text"
                label="Why Choose Closing Text"
                type="textarea"
                placeholder="Join hundreds of satisfied clients..."
                description="Closing text in the Why Choose section"
              />
              
              <ContentField
                section="global"
                contentKey="popup_offer_description"
                label="Popup Offer Description"
                type="textarea"
                placeholder="Join thousands of satisfied clients and start your design journey..."
                description="Description text in popup offers"
              />
              
              <ContentField
                section="global"
                contentKey="chatbot_portfolio_response"
                label="Chatbot Portfolio Response"
                type="textarea"
                placeholder="🏆 Check out my work..."
                description="Chatbot response when users ask about portfolio"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
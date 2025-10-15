/**
 * Homepage Content Editor
 * Unified editor for all homepage sections
 */

import { useState, useEffect } from 'react';
import { Save, Eye, RotateCcw, Plus, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface HomepageSection {
  id: string;
  type: 'hero' | 'services' | 'portfolio' | 'testimonials' | 'why_choose' | 'cta';
  title: string;
  content: Record<string, any>;
  enabled: boolean;
  order: number;
}

interface HomepageContent {
  sections: HomepageSection[];
  globalSettings: {
    siteName: string;
    tagline: string;
    primaryColor: string;
    secondaryColor: string;
  };
}

export function HomepageEditor() {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  useEffect(() => {
    loadHomepageContent();
  }, []);

  const loadHomepageContent = async () => {
    try {
      setLoading(true);
      // This would fetch from your API
      // const response = await adminApi.homepage.get();
      
      // Mock data for now - replace with API call
      const mockContent: HomepageContent = {
        sections: [
          {
            id: 'hero',
            type: 'hero',
            title: 'Hero Section',
            enabled: true,
            order: 1,
            content: {
              badge: 'Trusted by 500+ YouTubers & Brands',
              headline: 'Transform Your Brand with',
              headlineHighlight: 'Premium Designs',
              subtitle: 'Professional logo design, YouTube thumbnails, and video editing that converts viewers into loyal customers.',
              deliveryTime: 'Ready in 24-48 hours.',
              primaryCTA: 'Start Your Project',
              secondaryCTA: 'Watch My Intro',
              tertiaryCTA: 'Watch Portfolio',
              trustIndicators: [
                { label: 'Happy Clients', value: '500+' },
                { label: 'Delivery Time', value: '24-48h' },
                { label: 'Satisfaction Rate', value: '99%' },
                { label: 'Average Rating', value: '5.0★' }
              ]
            }
          },
          {
            id: 'why_choose',
            type: 'why_choose',
            title: 'Why Choose Section',
            enabled: true,
            order: 2,
            content: {
              sectionTitle: 'Why Choose',
              sectionHighlight: 'Adil',
              sectionSubtitle: 'Trusted by 500+ businesses and creators worldwide. Here\'s what sets me apart from the competition.',
              reasons: [
                {
                  icon: 'Zap',
                  title: 'Lightning Fast Delivery',
                  description: 'Most projects delivered within 24-48 hours without compromising quality',
                  stat: '24-48h',
                  color: 'text-yellow-500'
                },
                {
                  icon: 'Trophy',
                  title: 'Proven Results',
                  description: 'Designs that have generated millions in revenue and boosted client success',
                  stat: '500+ Projects',
                  color: 'text-youtube-red'
                }
              ],
              achievements: [
                { number: '500+', label: 'Happy Clients', description: 'Worldwide' },
                { number: '10M+', label: 'Views Generated', description: 'For YouTube clients' },
                { number: '$50M+', label: 'Revenue Impact', description: 'Client success stories' },
                { number: '24h', label: 'Average Delivery', description: 'For standard projects' }
              ]
            }
          }
        ],
        globalSettings: {
          siteName: 'Adil GFX',
          tagline: 'Professional Design Services',
          primaryColor: '#FF0000',
          secondaryColor: '#1F2937'
        }
      };
      
      setContent(mockContent);
    } catch (error) {
      console.error('Failed to load homepage content:', error);
      toast.error('Failed to load homepage content');
    } finally {
      setLoading(false);
    }
  };

  const saveHomepageContent = async () => {
    if (!content) return;

    try {
      setSaving(true);
      // This would save to your API
      // await adminApi.homepage.update(content);
      
      toast.success('Homepage content saved successfully!');
    } catch (error) {
      console.error('Failed to save homepage content:', error);
      toast.error('Failed to save homepage content');
    } finally {
      setSaving(false);
    }
  };

  const updateSectionContent = (sectionId: string, updates: Record<string, any>) => {
    if (!content) return;

    setContent(prev => ({
      ...prev!,
      sections: prev!.sections.map(section =>
        section.id === sectionId
          ? { ...section, content: { ...section.content, ...updates } }
          : section
      )
    }));
  };

  const toggleSection = (sectionId: string) => {
    if (!content) return;

    setContent(prev => ({
      ...prev!,
      sections: prev!.sections.map(section =>
        section.id === sectionId
          ? { ...section, enabled: !section.enabled }
          : section
      )
    }));
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-youtube-red"></div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-destructive">Failed to load homepage content</p>
          <Button onClick={loadHomepageContent} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const activeSection = content.sections.find(s => s.id === activeSection);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Homepage Editor</h1>
          <p className="text-muted-foreground mt-1">
            Edit all homepage content sections in one place
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open('/', '_blank')}>
            <Eye className="mr-2 h-4 w-4" />
            Preview Site
          </Button>
          <Button onClick={saveHomepageContent} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Section Navigator */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Page Sections</CardTitle>
              <CardDescription>
                Click to edit each section
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {content.sections.map((section) => (
                <div
                  key={section.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    activeSection === section.id 
                      ? 'bg-youtube-red/10 border-youtube-red' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${section.enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="font-medium">{section.title}</span>
                  </div>
                  <Switch
                    checked={section.enabled}
                    onCheckedChange={() => toggleSection(section.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Section Editor */}
        <div className="lg:col-span-3">
          <Tabs value={activeSection} onValueChange={setActiveSection}>
            {/* Hero Section */}
            <TabsContent value="hero" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hero Section</CardTitle>
                  <CardDescription>
                    Main homepage banner that visitors see first
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Badge */}
                  <div>
                    <Label htmlFor="hero-badge">Trust Badge</Label>
                    <Input
                      id="hero-badge"
                      value={content.sections[0]?.content.badge || ''}
                      onChange={(e) => updateSectionContent('hero', { badge: e.target.value })}
                      placeholder="Trusted by 500+ YouTubers & Brands"
                    />
                  </div>

                  {/* Headlines */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hero-headline">Main Headline</Label>
                      <Input
                        id="hero-headline"
                        value={content.sections[0]?.content.headline || ''}
                        onChange={(e) => updateSectionContent('hero', { headline: e.target.value })}
                        placeholder="Transform Your Brand with"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hero-highlight">Highlighted Text</Label>
                      <Input
                        id="hero-highlight"
                        value={content.sections[0]?.content.headlineHighlight || ''}
                        onChange={(e) => updateSectionContent('hero', { headlineHighlight: e.target.value })}
                        placeholder="Premium Designs"
                      />
                    </div>
                  </div>

                  {/* Subtitle */}
                  <div>
                    <Label htmlFor="hero-subtitle">Subtitle</Label>
                    <Textarea
                      id="hero-subtitle"
                      value={content.sections[0]?.content.subtitle || ''}
                      onChange={(e) => updateSectionContent('hero', { subtitle: e.target.value })}
                      placeholder="Professional logo design, YouTube thumbnails..."
                      rows={3}
                    />
                  </div>

                  {/* CTA Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="primary-cta">Primary CTA</Label>
                      <Input
                        id="primary-cta"
                        value={content.sections[0]?.content.primaryCTA || ''}
                        onChange={(e) => updateSectionContent('hero', { primaryCTA: e.target.value })}
                        placeholder="Start Your Project"
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondary-cta">Secondary CTA</Label>
                      <Input
                        id="secondary-cta"
                        value={content.sections[0]?.content.secondaryCTA || ''}
                        onChange={(e) => updateSectionContent('hero', { secondaryCTA: e.target.value })}
                        placeholder="Watch My Intro"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tertiary-cta">Tertiary CTA</Label>
                      <Input
                        id="tertiary-cta"
                        value={content.sections[0]?.content.tertiaryCTA || ''}
                        onChange={(e) => updateSectionContent('hero', { tertiaryCTA: e.target.value })}
                        placeholder="Watch Portfolio"
                      />
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">Trust Indicators</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {content.sections[0]?.content.trustIndicators?.map((indicator: any, index: number) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="Label"
                            value={indicator.label}
                            onChange={(e) => {
                              const newIndicators = [...(content.sections[0]?.content.trustIndicators || [])];
                              newIndicators[index] = { ...indicator, label: e.target.value };
                              updateSectionContent('hero', { trustIndicators: newIndicators });
                            }}
                          />
                          <Input
                            placeholder="Value"
                            value={indicator.value}
                            onChange={(e) => {
                              const newIndicators = [...(content.sections[0]?.content.trustIndicators || [])];
                              newIndicators[index] = { ...indicator, value: e.target.value };
                              updateSectionContent('hero', { trustIndicators: newIndicators });
                            }}
                          />
                        </div>
                      )) || null}
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
                    Highlight your unique value propositions and achievements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Section Header */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="why-title">Section Title</Label>
                      <Input
                        id="why-title"
                        value={content.sections[1]?.content.sectionTitle || ''}
                        onChange={(e) => updateSectionContent('why_choose', { sectionTitle: e.target.value })}
                        placeholder="Why Choose"
                      />
                    </div>
                    <div>
                      <Label htmlFor="why-highlight">Highlighted Text</Label>
                      <Input
                        id="why-highlight"
                        value={content.sections[1]?.content.sectionHighlight || ''}
                        onChange={(e) => updateSectionContent('why_choose', { sectionHighlight: e.target.value })}
                        placeholder="Adil"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="why-subtitle">Section Subtitle</Label>
                    <Textarea
                      id="why-subtitle"
                      value={content.sections[1]?.content.sectionSubtitle || ''}
                      onChange={(e) => updateSectionContent('why_choose', { sectionSubtitle: e.target.value })}
                      placeholder="Trusted by 500+ businesses and creators worldwide..."
                      rows={2}
                    />
                  </div>

                  {/* Achievement Stats */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">Achievement Statistics</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {content.sections[1]?.content.achievements?.map((achievement: any, index: number) => (
                        <Card key={index} className="p-4">
                          <div className="grid grid-cols-3 gap-2">
                            <Input
                              placeholder="Number"
                              value={achievement.number}
                              onChange={(e) => {
                                const newAchievements = [...(content.sections[1]?.content.achievements || [])];
                                newAchievements[index] = { ...achievement, number: e.target.value };
                                updateSectionContent('why_choose', { achievements: newAchievements });
                              }}
                            />
                            <Input
                              placeholder="Label"
                              value={achievement.label}
                              onChange={(e) => {
                                const newAchievements = [...(content.sections[1]?.content.achievements || [])];
                                newAchievements[index] = { ...achievement, label: e.target.value };
                                updateSectionContent('why_choose', { achievements: newAchievements });
                              }}
                            />
                            <Input
                              placeholder="Description"
                              value={achievement.description}
                              onChange={(e) => {
                                const newAchievements = [...(content.sections[1]?.content.achievements || [])];
                                newAchievements[index] = { ...achievement, description: e.target.value };
                                updateSectionContent('why_choose', { achievements: newAchievements });
                              }}
                            />
                          </div>
                        </Card>
                      )) || null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Section Selector Tabs */}
          <div className="mb-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
              <TabsTrigger value="why_choose">Why Choose</TabsTrigger>
              <TabsTrigger value="cta">CTAs</TabsTrigger>
            </TabsList>
          </div>
        </div>
      </div>

      {/* Save Bar */}
      <div className="fixed bottom-0 left-64 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="text-sm text-muted-foreground">
            Last saved: Never
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadHomepageContent}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Changes
            </Button>
            <Button onClick={saveHomepageContent} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
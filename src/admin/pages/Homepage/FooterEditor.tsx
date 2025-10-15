/**
 * Footer Editor
 * Edit footer content, links, and social media
 */

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface FooterLink {
  id: string;
  name: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
  enabled: boolean;
}

interface SocialLink {
  id: string;
  name: string;
  href: string;
  icon: string;
  enabled: boolean;
}

interface FooterSettings {
  companyInfo: {
    name: string;
    description: string;
    logo: string;
  };
  sections: FooterSection[];
  socialLinks: SocialLink[];
  newsletter: {
    enabled: boolean;
    title: string;
    description: string;
    buttonText: string;
  };
  bottomBar: {
    copyrightText: string;
    contactEmail: string;
    whatsappNumber: string;
  };
}

const availableSocialIcons = [
  'Facebook', 'Instagram', 'Linkedin', 'Youtube', 'Twitter', 'TikTok', 'Discord'
];

export function FooterEditor() {
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFooterSettings();
  }, []);

  const loadFooterSettings = async () => {
    try {
      setLoading(true);
      // Mock data - replace with API call
      const mockSettings: FooterSettings = {
        companyInfo: {
          name: 'Adil GFX',
          description: 'Professional designer helping brands and YouTubers grow through premium visual content.',
          logo: '/logo.png'
        },
        sections: [
          {
            id: 'services',
            title: 'Services',
            enabled: true,
            links: [
              { id: '1', name: 'Logo Design', href: '/services#logo' },
              { id: '2', name: 'YouTube Thumbnails', href: '/services#thumbnails' },
              { id: '3', name: 'Video Editing', href: '/services#video' },
              { id: '4', name: 'YouTube Setup & Branding', href: '/services#youtube-branding' }
            ]
          },
          {
            id: 'explore',
            title: 'Explore',
            enabled: true,
            links: [
              { id: '5', name: 'Portfolio', href: '/portfolio' },
              { id: '6', name: 'Blog', href: '/blog' },
              { id: '7', name: 'Testimonials', href: '/testimonials' },
              { id: '8', name: 'Case Studies', href: '/testimonials#case-studies' }
            ]
          },
          {
            id: 'support',
            title: 'Support',
            enabled: true,
            links: [
              { id: '9', name: 'FAQ', href: '/faq' },
              { id: '10', name: 'Contact', href: '/contact' },
              { id: '11', name: 'Privacy Policy', href: '/privacy' },
              { id: '12', name: 'Terms & Conditions', href: '/terms' }
            ]
          },
          {
            id: 'business',
            title: 'Business',
            enabled: true,
            links: [
              { id: '13', name: 'Hire Me (Direct)', href: '/contact' },
              { id: '14', name: 'Fiverr Profile', href: 'https://fiverr.com/adilgfx', external: true },
              { id: '15', name: 'Media Kit (PDF)', href: '/media-kit.pdf' },
              { id: '16', name: 'Free Templates', href: '#lead-magnet' }
            ]
          }
        ],
        socialLinks: [
          { id: '1', name: 'Facebook', href: 'https://facebook.com/adilgfx', icon: 'Facebook', enabled: true },
          { id: '2', name: 'Instagram', href: 'https://instagram.com/adilgfx', icon: 'Instagram', enabled: true },
          { id: '3', name: 'LinkedIn', href: 'https://linkedin.com/in/adilgfx', icon: 'Linkedin', enabled: true }
        ],
        newsletter: {
          enabled: true,
          title: 'Stay Updated',
          description: 'Get free design tips, latest trends, and exclusive offers delivered to your inbox.',
          buttonText: 'Subscribe Now'
        },
        bottomBar: {
          copyrightText: '© 2025 GFX by Adi. All rights reserved.',
          contactEmail: 'hello@adilgfx.com',
          whatsappNumber: '+1234567890'
        }
      };
      
      setSettings(mockSettings);
    } catch (error) {
      console.error('Failed to load footer settings:', error);
      toast.error('Failed to load footer settings');
    } finally {
      setLoading(false);
    }
  };

  const saveFooterSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      // This would save to your API
      // await adminApi.footer.update(settings);
      
      toast.success('Footer settings saved successfully!');
    } catch (error) {
      console.error('Failed to save footer settings:', error);
      toast.error('Failed to save footer settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-youtube-red"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Footer Editor</h1>
          <p className="text-muted-foreground mt-1">
            Customize footer content, links, and social media
          </p>
        </div>
        
        <Button onClick={saveFooterSettings} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList>
          <TabsTrigger value="company">Company Info</TabsTrigger>
          <TabsTrigger value="links">Footer Links</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
        </TabsList>

        {/* Company Info */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Basic company details displayed in footer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={settings.companyInfo.name}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    companyInfo: { ...prev!.companyInfo, name: e.target.value }
                  }))}
                  placeholder="Adil GFX"
                />
              </div>

              <div>
                <Label htmlFor="company-description">Description</Label>
                <Textarea
                  id="company-description"
                  value={settings.companyInfo.description}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    companyInfo: { ...prev!.companyInfo, description: e.target.value }
                  }))}
                  placeholder="Professional designer helping brands..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="copyright">Copyright Text</Label>
                <Input
                  id="copyright"
                  value={settings.bottomBar.copyrightText}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    bottomBar: { ...prev!.bottomBar, copyrightText: e.target.value }
                  }))}
                  placeholder="© 2025 GFX by Adi. All rights reserved."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={settings.bottomBar.contactEmail}
                    onChange={(e) => setSettings(prev => ({
                      ...prev!,
                      bottomBar: { ...prev!.bottomBar, contactEmail: e.target.value }
                    }))}
                    placeholder="hello@adilgfx.com"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input
                    id="whatsapp"
                    value={settings.bottomBar.whatsappNumber}
                    onChange={(e) => setSettings(prev => ({
                      ...prev!,
                      bottomBar: { ...prev!.bottomBar, whatsappNumber: e.target.value }
                    }))}
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Links */}
        <TabsContent value="links" className="space-y-6">
          {settings.sections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{section.title} Section</CardTitle>
                    <CardDescription>
                      Manage links in the {section.title.toLowerCase()} section
                    </CardDescription>
                  </div>
                  <Switch
                    checked={section.enabled}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev!,
                      sections: prev!.sections.map(s =>
                        s.id === section.id ? { ...s, enabled: checked } : s
                      )
                    }))}
                  />
                </div>
              </CardHeader>
              {section.enabled && (
                <CardContent className="space-y-4">
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={section.title}
                      onChange={(e) => setSettings(prev => ({
                        ...prev!,
                        sections: prev!.sections.map(s =>
                          s.id === section.id ? { ...s, title: e.target.value } : s
                        )
                      }))}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Links</Label>
                    {section.links.map((link) => (
                      <div key={link.id} className="flex items-center gap-4 p-3 border rounded">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Link Name"
                            value={link.name}
                            onChange={(e) => {
                              const updatedLinks = section.links.map(l =>
                                l.id === link.id ? { ...l, name: e.target.value } : l
                              );
                              setSettings(prev => ({
                                ...prev!,
                                sections: prev!.sections.map(s =>
                                  s.id === section.id ? { ...s, links: updatedLinks } : s
                                )
                              }));
                            }}
                          />
                          <Input
                            placeholder="Link URL"
                            value={link.href}
                            onChange={(e) => {
                              const updatedLinks = section.links.map(l =>
                                l.id === link.id ? { ...l, href: e.target.value } : l
                              );
                              setSettings(prev => ({
                                ...prev!,
                                sections: prev!.sections.map(s =>
                                  s.id === section.id ? { ...s, links: updatedLinks } : s
                                )
                              }));
                            }}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updatedLinks = section.links.filter(l => l.id !== link.id);
                            setSettings(prev => ({
                              ...prev!,
                              sections: prev!.sections.map(s =>
                                s.id === section.id ? { ...s, links: updatedLinks } : s
                              )
                            }));
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newLink: FooterLink = {
                          id: Date.now().toString(),
                          name: 'New Link',
                          href: '/'
                        };
                        setSettings(prev => ({
                          ...prev!,
                          sections: prev!.sections.map(s =>
                            s.id === section.id ? { ...s, links: [...s.links, newLink] } : s
                          )
                        }));
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Link
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        {/* Social Media */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>
                Manage your social media presence in the footer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.socialLinks.map((social) => (
                <div key={social.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Switch
                    checked={social.enabled}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev!,
                      socialLinks: prev!.socialLinks.map(s =>
                        s.id === social.id ? { ...s, enabled: checked } : s
                      )
                    }))}
                  />
                  
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Platform Name"
                      value={social.name}
                      onChange={(e) => setSettings(prev => ({
                        ...prev!,
                        socialLinks: prev!.socialLinks.map(s =>
                          s.id === social.id ? { ...s, name: e.target.value } : s
                        )
                      }))}
                    />
                    <Input
                      placeholder="Profile URL"
                      value={social.href}
                      onChange={(e) => setSettings(prev => ({
                        ...prev!,
                        socialLinks: prev!.socialLinks.map(s =>
                          s.id === social.id ? { ...s, href: e.target.value } : s
                        )
                      }))}
                    />
                    <select
                      value={social.icon}
                      onChange={(e) => setSettings(prev => ({
                        ...prev!,
                        socialLinks: prev!.socialLinks.map(s =>
                          s.id === social.id ? { ...s, icon: e.target.value } : s
                        )
                      }))}
                      className="px-3 py-2 border border-input bg-background rounded-md"
                    >
                      {availableSocialIcons.map((icon) => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSettings(prev => ({
                      ...prev!,
                      socialLinks: prev!.socialLinks.filter(s => s.id !== social.id)
                    }))}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              
              <Button
                variant="outline"
                onClick={() => {
                  const newSocial: SocialLink = {
                    id: Date.now().toString(),
                    name: 'New Platform',
                    href: 'https://',
                    icon: 'Facebook',
                    enabled: true
                  };
                  setSettings(prev => ({
                    ...prev!,
                    socialLinks: [...prev!.socialLinks, newSocial]
                  }));
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Social Platform
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Newsletter */}
        <TabsContent value="newsletter" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Newsletter Signup</CardTitle>
                  <CardDescription>
                    Configure the newsletter signup section in footer
                  </CardDescription>
                </div>
                <Switch
                  checked={settings.newsletter.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev!,
                    newsletter: { ...prev!.newsletter, enabled: checked }
                  }))}
                />
              </div>
            </CardHeader>
            {settings.newsletter.enabled && (
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="newsletter-title">Title</Label>
                  <Input
                    id="newsletter-title"
                    value={settings.newsletter.title}
                    onChange={(e) => setSettings(prev => ({
                      ...prev!,
                      newsletter: { ...prev!.newsletter, title: e.target.value }
                    }))}
                    placeholder="Stay Updated"
                  />
                </div>

                <div>
                  <Label htmlFor="newsletter-description">Description</Label>
                  <Textarea
                    id="newsletter-description"
                    value={settings.newsletter.description}
                    onChange={(e) => setSettings(prev => ({
                      ...prev!,
                      newsletter: { ...prev!.newsletter, description: e.target.value }
                    }))}
                    placeholder="Get free design tips, latest trends..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="newsletter-button">Button Text</Label>
                  <Input
                    id="newsletter-button"
                    value={settings.newsletter.buttonText}
                    onChange={(e) => setSettings(prev => ({
                      ...prev!,
                      newsletter: { ...prev!.newsletter, buttonText: e.target.value }
                    }))}
                    placeholder="Subscribe Now"
                  />
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
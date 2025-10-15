/**
 * Navigation Editor
 * Edit navigation menu items, logo, and CTA buttons
 */

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, MoveUp, MoveDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: string;
  enabled: boolean;
  order: number;
  external?: boolean;
}

interface NavigationSettings {
  logo: {
    text: string;
    imageUrl?: string;
    showIcon: boolean;
  };
  menuItems: NavigationItem[];
  ctaButton: {
    text: string;
    href: string;
    enabled: boolean;
  };
  mobileSettings: {
    showSearch: boolean;
    showThemeToggle: boolean;
    showLanguageToggle: boolean;
  };
}

const availableIcons = [
  'Play', 'Palette', 'Briefcase', 'User', 'Star', 'FileText', 
  'HelpCircle', 'Phone', 'Home', 'Settings', 'Mail'
];

export function NavigationEditor() {
  const [settings, setSettings] = useState<NavigationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNavigationSettings();
  }, []);

  const loadNavigationSettings = async () => {
    try {
      setLoading(true);
      // Mock data - replace with API call
      const mockSettings: NavigationSettings = {
        logo: {
          text: 'Adil GFX',
          showIcon: true,
        },
        menuItems: [
          { id: '1', name: 'Home', href: '/', icon: 'Play', enabled: true, order: 1 },
          { id: '2', name: 'Portfolio', href: '/portfolio', icon: 'Palette', enabled: true, order: 2 },
          { id: '3', name: 'Services', href: '/services', icon: 'Briefcase', enabled: true, order: 3 },
          { id: '4', name: 'About', href: '/about', icon: 'User', enabled: true, order: 4 },
          { id: '5', name: 'Testimonials', href: '/testimonials', icon: 'Star', enabled: true, order: 5 },
          { id: '6', name: 'Blog', href: '/blog', icon: 'FileText', enabled: true, order: 6 },
          { id: '7', name: 'FAQ', href: '/faq', icon: 'HelpCircle', enabled: true, order: 7 },
          { id: '8', name: 'Contact', href: '/contact', icon: 'Phone', enabled: true, order: 8 },
        ],
        ctaButton: {
          text: 'Hire Me Now',
          href: '/contact',
          enabled: true,
        },
        mobileSettings: {
          showSearch: false,
          showThemeToggle: true,
          showLanguageToggle: true,
        }
      };
      
      setSettings(mockSettings);
    } catch (error) {
      console.error('Failed to load navigation settings:', error);
      toast.error('Failed to load navigation settings');
    } finally {
      setLoading(false);
    }
  };

  const saveNavigationSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      // This would save to your API
      // await adminApi.navigation.update(settings);
      
      toast.success('Navigation settings saved successfully!');
    } catch (error) {
      console.error('Failed to save navigation settings:', error);
      toast.error('Failed to save navigation settings');
    } finally {
      setSaving(false);
    }
  };

  const addMenuItem = () => {
    if (!settings) return;

    const newItem: NavigationItem = {
      id: Date.now().toString(),
      name: 'New Item',
      href: '/',
      icon: 'Home',
      enabled: true,
      order: settings.menuItems.length + 1,
    };

    setSettings(prev => ({
      ...prev!,
      menuItems: [...prev!.menuItems, newItem]
    }));
  };

  const removeMenuItem = (id: string) => {
    if (!settings) return;

    setSettings(prev => ({
      ...prev!,
      menuItems: prev!.menuItems.filter(item => item.id !== id)
    }));
  };

  const updateMenuItem = (id: string, updates: Partial<NavigationItem>) => {
    if (!settings) return;

    setSettings(prev => ({
      ...prev!,
      menuItems: prev!.menuItems.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  };

  const moveMenuItem = (id: string, direction: 'up' | 'down') => {
    if (!settings) return;

    const items = [...settings.menuItems];
    const index = items.findIndex(item => item.id === id);
    
    if (direction === 'up' && index > 0) {
      [items[index], items[index - 1]] = [items[index - 1], items[index]];
    } else if (direction === 'down' && index < items.length - 1) {
      [items[index], items[index + 1]] = [items[index + 1], items[index]];
    }

    // Update order numbers
    items.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setSettings(prev => ({
      ...prev!,
      menuItems: items
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

  if (!settings) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-destructive">Failed to load navigation settings</p>
          <Button onClick={loadNavigationSettings} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Navigation Editor</h1>
          <p className="text-muted-foreground mt-1">
            Customize your site navigation, logo, and menu items
          </p>
        </div>
        
        <Button onClick={saveNavigationSettings} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Logo Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Logo & Branding</CardTitle>
            <CardDescription>
              Configure your site logo and branding elements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="logo-text">Logo Text</Label>
              <Input
                id="logo-text"
                value={settings.logo.text}
                onChange={(e) => setSettings(prev => ({
                  ...prev!,
                  logo: { ...prev!.logo, text: e.target.value }
                }))}
                placeholder="Adil GFX"
              />
            </div>

            <div>
              <Label htmlFor="logo-image">Logo Image URL (Optional)</Label>
              <Input
                id="logo-image"
                value={settings.logo.imageUrl || ''}
                onChange={(e) => setSettings(prev => ({
                  ...prev!,
                  logo: { ...prev!.logo, imageUrl: e.target.value }
                }))}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show Icon</Label>
                <p className="text-sm text-muted-foreground">
                  Display the "A" icon next to logo text
                </p>
              </div>
              <Switch
                checked={settings.logo.showIcon}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev!,
                  logo: { ...prev!.logo, showIcon: checked }
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* CTA Button */}
        <Card>
          <CardHeader>
            <CardTitle>Call-to-Action Button</CardTitle>
            <CardDescription>
              Configure the main CTA button in navigation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable CTA Button</Label>
                <p className="text-sm text-muted-foreground">
                  Show CTA button in navigation
                </p>
              </div>
              <Switch
                checked={settings.ctaButton.enabled}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev!,
                  ctaButton: { ...prev!.ctaButton, enabled: checked }
                }))}
              />
            </div>

            {settings.ctaButton.enabled && (
              <>
                <div>
                  <Label htmlFor="cta-text">Button Text</Label>
                  <Input
                    id="cta-text"
                    value={settings.ctaButton.text}
                    onChange={(e) => setSettings(prev => ({
                      ...prev!,
                      ctaButton: { ...prev!.ctaButton, text: e.target.value }
                    }))}
                    placeholder="Hire Me Now"
                  />
                </div>

                <div>
                  <Label htmlFor="cta-href">Button Link</Label>
                  <Input
                    id="cta-href"
                    value={settings.ctaButton.href}
                    onChange={(e) => setSettings(prev => ({
                      ...prev!,
                      ctaButton: { ...prev!.ctaButton, href: e.target.value }
                    }))}
                    placeholder="/contact"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Menu Items */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Menu Items</CardTitle>
              <CardDescription>
                Manage navigation menu items and their order
              </CardDescription>
            </div>
            <Button onClick={addMenuItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Menu Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.menuItems
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveMenuItem(item.id, 'up')}
                      disabled={item.order === 1}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveMenuItem(item.id, 'down')}
                      disabled={item.order === settings.menuItems.length}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                      placeholder="Menu Name"
                      value={item.name}
                      onChange={(e) => updateMenuItem(item.id, { name: e.target.value })}
                    />
                    <Input
                      placeholder="Link (/page or https://...)"
                      value={item.href}
                      onChange={(e) => updateMenuItem(item.id, { href: e.target.value })}
                    />
                    <Select
                      value={item.icon}
                      onValueChange={(value) => updateMenuItem(item.id, { icon: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableIcons.map((icon) => (
                          <SelectItem key={icon} value={icon}>
                            {icon}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.enabled}
                        onCheckedChange={(checked) => updateMenuItem(item.id, { enabled: checked })}
                      />
                      <span className="text-sm">Enabled</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.href.startsWith('http') && (
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMenuItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
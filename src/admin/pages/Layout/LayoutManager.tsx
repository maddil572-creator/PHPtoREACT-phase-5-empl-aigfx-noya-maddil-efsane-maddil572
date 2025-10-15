import { useState, useEffect } from 'react';
import { Save, Eye, Palette, Layout, Menu, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useHomepage } from '@/admin/hooks/useHomepage';

const HEADER_STYLES = [
  { value: 'modern', label: 'Modern', description: 'Clean, contemporary design' },
  { value: 'classic', label: 'Classic', description: 'Traditional, professional look' },
  { value: 'minimal', label: 'Minimal', description: 'Simple, clean interface' },
];

const HEADER_BACKGROUNDS = [
  { value: 'transparent', label: 'Transparent' },
  { value: 'solid', label: 'Solid Color' },
  { value: 'gradient', label: 'Gradient' },
];

const HEADER_POSITIONS = [
  { value: 'sticky', label: 'Sticky (Follows scroll)' },
  { value: 'fixed', label: 'Fixed (Always visible)' },
  { value: 'static', label: 'Static (Normal flow)' },
];

const MOBILE_MENU_STYLES = [
  { value: 'slide', label: 'Slide In' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'fullscreen', label: 'Fullscreen Overlay' },
];

const FOOTER_STYLES = [
  { value: 'modern', label: 'Modern', description: 'Contemporary multi-column layout' },
  { value: 'classic', label: 'Classic', description: 'Traditional footer design' },
  { value: 'minimal', label: 'Minimal', description: 'Simple, compact footer' },
];

const FOOTER_BACKGROUNDS = [
  { value: 'dark', label: 'Dark Theme' },
  { value: 'light', label: 'Light Theme' },
  { value: 'gradient', label: 'Gradient' },
];

const COPYRIGHT_POSITIONS = [
  { value: 'left', label: 'Left Aligned' },
  { value: 'center', label: 'Center Aligned' },
  { value: 'right', label: 'Right Aligned' },
];

interface MenuLink {
  text: string;
  url: string;
  style?: string;
}

interface FooterSection {
  title: string;
  links: Array<{ text: string; url: string }>;
}

export function LayoutManager() {
  const { fetchContent, updateContent, loading, error } = useHomepage();
  const [headerConfig, setHeaderConfig] = useState<any>({});
  const [footerConfig, setFooterConfig] = useState<any>({});
  const [headerMenuItems, setHeaderMenuItems] = useState<MenuLink[]>([]);
  const [footerSections, setFooterSections] = useState<FooterSection[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLayoutConfig();
  }, []);

  const loadLayoutConfig = async () => {
    try {
      const [headerData, footerData, headerMenuData, footerMenuData] = await Promise.all([
        fetchContent('header'),
        fetchContent('footer'),
        fetchContent('header_menu'),
        fetchContent('footer_menu'),
      ]);

      // Process header config
      const headerObj: any = {};
      headerData.forEach((item: any) => {
        headerObj[item.content_key] = item.content_value;
      });
      setHeaderConfig(headerObj);

      // Process footer config
      const footerObj: any = {};
      footerData.forEach((item: any) => {
        footerObj[item.content_key] = item.content_value;
      });
      setFooterConfig(footerObj);

      // Process header menu items
      const menuItems: MenuLink[] = [];
      for (let i = 1; i <= 5; i++) {
        const text = headerMenuData.find((item: any) => item.content_key === `item_${i}_text`)?.content_value;
        const url = headerMenuData.find((item: any) => item.content_key === `item_${i}_url`)?.content_value;
        const style = headerMenuData.find((item: any) => item.content_key === `item_${i}_style`)?.content_value;
        
        if (text && url) {
          menuItems.push({ text, url, style: style || 'link' });
        }
      }
      setHeaderMenuItems(menuItems);

      // Process footer sections
      const sections: FooterSection[] = [];
      for (let i = 1; i <= 4; i++) {
        const title = footerMenuData.find((item: any) => item.content_key === `section_${i}_title`)?.content_value;
        const linksStr = footerMenuData.find((item: any) => item.content_key === `section_${i}_links`)?.content_value;
        
        if (title && linksStr) {
          const links = linksStr.split(',').map((link: string) => {
            const [text, url] = link.split(':');
            return { text: text.trim(), url: url.trim() };
          }).filter((link: any) => link.text && link.url);
          
          sections.push({ title, links });
        }
      }
      setFooterSections(sections);

    } catch (error) {
      toast.error('Failed to load layout configuration');
      console.error('Error loading layout config:', error);
    }
  };

  const saveHeaderConfig = async () => {
    try {
      setSaving(true);
      
      // Save header configuration
      for (const [key, value] of Object.entries(headerConfig)) {
        await updateContent('header', key, value as string);
      }

      // Save header menu items
      for (let i = 0; i < headerMenuItems.length; i++) {
        const item = headerMenuItems[i];
        await updateContent('header_menu', `item_${i + 1}_text`, item.text);
        await updateContent('header_menu', `item_${i + 1}_url`, item.url);
        await updateContent('header_menu', `item_${i + 1}_style`, item.style || 'link');
      }

      toast.success('Header configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save header configuration');
    } finally {
      setSaving(false);
    }
  };

  const saveFooterConfig = async () => {
    try {
      setSaving(true);
      
      // Save footer configuration
      for (const [key, value] of Object.entries(footerConfig)) {
        await updateContent('footer', key, value as string);
      }

      // Save footer sections
      for (let i = 0; i < footerSections.length; i++) {
        const section = footerSections[i];
        await updateContent('footer_menu', `section_${i + 1}_title`, section.title);
        
        const linksStr = section.links.map(link => `${link.text}:${link.url}`).join(',');
        await updateContent('footer_menu', `section_${i + 1}_links`, linksStr);
      }

      toast.success('Footer configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save footer configuration');
    } finally {
      setSaving(false);
    }
  };

  const addHeaderMenuItem = () => {
    if (headerMenuItems.length < 5) {
      setHeaderMenuItems([...headerMenuItems, { text: '', url: '', style: 'link' }]);
    }
  };

  const updateHeaderMenuItem = (index: number, field: keyof MenuLink, value: string) => {
    const updated = [...headerMenuItems];
    updated[index] = { ...updated[index], [field]: value };
    setHeaderMenuItems(updated);
  };

  const removeHeaderMenuItem = (index: number) => {
    setHeaderMenuItems(headerMenuItems.filter((_, i) => i !== index));
  };

  const addFooterSection = () => {
    if (footerSections.length < 4) {
      setFooterSections([...footerSections, { title: '', links: [] }]);
    }
  };

  const updateFooterSection = (index: number, field: 'title', value: string) => {
    const updated = [...footerSections];
    updated[index] = { ...updated[index], [field]: value };
    setFooterSections(updated);
  };

  const addFooterLink = (sectionIndex: number) => {
    const updated = [...footerSections];
    updated[sectionIndex].links.push({ text: '', url: '' });
    setFooterSections(updated);
  };

  const updateFooterLink = (sectionIndex: number, linkIndex: number, field: 'text' | 'url', value: string) => {
    const updated = [...footerSections];
    updated[sectionIndex].links[linkIndex][field] = value;
    setFooterSections(updated);
  };

  const removeFooterLink = (sectionIndex: number, linkIndex: number) => {
    const updated = [...footerSections];
    updated[sectionIndex].links = updated[sectionIndex].links.filter((_, i) => i !== linkIndex);
    setFooterSections(updated);
  };

  const removeFooterSection = (index: number) => {
    setFooterSections(footerSections.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading layout configuration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <Button onClick={loadLayoutConfig}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Layout Manager</h2>
          <p className="text-muted-foreground">Customize your website's header and footer</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open('/', '_blank')}>
            <Eye className="h-4 w-4 mr-2" />
            Preview Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="header" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="header" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Header Configuration
          </TabsTrigger>
          <TabsTrigger value="footer" className="flex items-center gap-2">
            <Menu className="h-4 w-4" />
            Footer Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="header" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Header Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and behavior of your website header
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show_header"
                  checked={headerConfig.show_header === 'true'}
                  onCheckedChange={(checked) => setHeaderConfig(prev => ({ ...prev, show_header: checked.toString() }))}
                />
                <Label htmlFor="show_header">Show Header</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="header_style">Header Style</Label>
                  <Select
                    value={headerConfig.header_style || 'modern'}
                    onValueChange={(value) => setHeaderConfig(prev => ({ ...prev, header_style: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HEADER_STYLES.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-sm text-muted-foreground">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="header_background">Background Style</Label>
                  <Select
                    value={headerConfig.header_background || 'transparent'}
                    onValueChange={(value) => setHeaderConfig(prev => ({ ...prev, header_background: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HEADER_BACKGROUNDS.map((bg) => (
                        <SelectItem key={bg.value} value={bg.value}>
                          {bg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="header_position">Position</Label>
                  <Select
                    value={headerConfig.header_position || 'sticky'}
                    onValueChange={(value) => setHeaderConfig(prev => ({ ...prev, header_position: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HEADER_POSITIONS.map((pos) => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="header_height">Header Height (px)</Label>
                  <Input
                    id="header_height"
                    type="number"
                    value={headerConfig.header_height || '80'}
                    onChange={(e) => setHeaderConfig(prev => ({ ...prev, header_height: e.target.value }))}
                    min="60"
                    max="120"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Header Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show_search"
                      checked={headerConfig.show_search === 'true'}
                      onCheckedChange={(checked) => setHeaderConfig(prev => ({ ...prev, show_search: checked.toString() }))}
                    />
                    <Label htmlFor="show_search">Show Search Bar</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show_language_switcher"
                      checked={headerConfig.show_language_switcher === 'true'}
                      onCheckedChange={(checked) => setHeaderConfig(prev => ({ ...prev, show_language_switcher: checked.toString() }))}
                    />
                    <Label htmlFor="show_language_switcher">Language Switcher</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show_theme_toggle"
                      checked={headerConfig.show_theme_toggle === 'true'}
                      onCheckedChange={(checked) => setHeaderConfig(prev => ({ ...prev, show_theme_toggle: checked.toString() }))}
                    />
                    <Label htmlFor="show_theme_toggle">Theme Toggle</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile_menu_style">Mobile Menu Style</Label>
                <Select
                  value={headerConfig.mobile_menu_style || 'slide'}
                  onValueChange={(value) => setHeaderConfig(prev => ({ ...prev, mobile_menu_style: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOBILE_MENU_STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Menu className="h-5 w-5" />
                  Header Menu Items
                </span>
                <Button onClick={addHeaderMenuItem} size="sm" disabled={headerMenuItems.length >= 5}>
                  Add Item
                </Button>
              </CardTitle>
              <CardDescription>
                Add custom menu items to your header (max 5 items)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {headerMenuItems.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Item {index + 1}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeHeaderMenuItem(index)}
                      className="text-red-500"
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Text</Label>
                      <Input
                        value={item.text}
                        onChange={(e) => updateHeaderMenuItem(index, 'text', e.target.value)}
                        placeholder="Menu item text"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>URL</Label>
                      <Input
                        value={item.url}
                        onChange={(e) => updateHeaderMenuItem(index, 'url', e.target.value)}
                        placeholder="/page-url"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Style</Label>
                      <Select
                        value={item.style || 'link'}
                        onValueChange={(value) => updateHeaderMenuItem(index, 'style', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="link">Link</SelectItem>
                          <SelectItem value="button">Button</SelectItem>
                          <SelectItem value="highlight">Highlight</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              
              {headerMenuItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No custom header menu items yet. Click "Add Item" to create one.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveHeaderConfig} disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Header
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="footer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Footer Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and content of your website footer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show_footer"
                  checked={footerConfig.show_footer === 'true'}
                  onCheckedChange={(checked) => setFooterConfig(prev => ({ ...prev, show_footer: checked.toString() }))}
                />
                <Label htmlFor="show_footer">Show Footer</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="footer_style">Footer Style</Label>
                  <Select
                    value={footerConfig.footer_style || 'modern'}
                    onValueChange={(value) => setFooterConfig(prev => ({ ...prev, footer_style: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FOOTER_STYLES.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-sm text-muted-foreground">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footer_background">Background Theme</Label>
                  <Select
                    value={footerConfig.footer_background || 'dark'}
                    onValueChange={(value) => setFooterConfig(prev => ({ ...prev, footer_background: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FOOTER_BACKGROUNDS.map((bg) => (
                        <SelectItem key={bg.value} value={bg.value}>
                          {bg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footer_columns">Number of Columns</Label>
                  <Select
                    value={footerConfig.footer_columns || '4'}
                    onValueChange={(value) => setFooterConfig(prev => ({ ...prev, footer_columns: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Columns</SelectItem>
                      <SelectItem value="3">3 Columns</SelectItem>
                      <SelectItem value="4">4 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="copyright_position">Copyright Position</Label>
                  <Select
                    value={footerConfig.copyright_position || 'center'}
                    onValueChange={(value) => setFooterConfig(prev => ({ ...prev, copyright_position: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COPYRIGHT_POSITIONS.map((pos) => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Footer Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show_newsletter"
                      checked={footerConfig.show_newsletter === 'true'}
                      onCheckedChange={(checked) => setFooterConfig(prev => ({ ...prev, show_newsletter: checked.toString() }))}
                    />
                    <Label htmlFor="show_newsletter">Newsletter Signup</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show_social_links"
                      checked={footerConfig.show_social_links === 'true'}
                      onCheckedChange={(checked) => setFooterConfig(prev => ({ ...prev, show_social_links: checked.toString() }))}
                    />
                    <Label htmlFor="show_social_links">Social Media Links</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show_back_to_top"
                      checked={footerConfig.show_back_to_top === 'true'}
                      onCheckedChange={(checked) => setFooterConfig(prev => ({ ...prev, show_back_to_top: checked.toString() }))}
                    />
                    <Label htmlFor="show_back_to_top">Back to Top Button</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Menu className="h-5 w-5" />
                  Footer Menu Sections
                </span>
                <Button onClick={addFooterSection} size="sm" disabled={footerSections.length >= 4}>
                  Add Section
                </Button>
              </CardTitle>
              <CardDescription>
                Create organized menu sections for your footer (max 4 sections)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {footerSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Section {sectionIndex + 1}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFooterSection(sectionIndex)}
                      className="text-red-500"
                    >
                      Remove Section
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={section.title}
                      onChange={(e) => updateFooterSection(sectionIndex, 'title', e.target.value)}
                      placeholder="Section title (e.g., Services, Company)"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Links</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addFooterLink(sectionIndex)}
                      >
                        Add Link
                      </Button>
                    </div>
                    
                    {section.links.map((link, linkIndex) => (
                      <div key={linkIndex} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-2">
                          <Label className="text-xs">Link Text</Label>
                          <Input
                            value={link.text}
                            onChange={(e) => updateFooterLink(sectionIndex, linkIndex, 'text', e.target.value)}
                            placeholder="Link text"
                            size="sm"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label className="text-xs">URL</Label>
                          <Input
                            value={link.url}
                            onChange={(e) => updateFooterLink(sectionIndex, linkIndex, 'url', e.target.value)}
                            placeholder="/page-url"
                            size="sm"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFooterLink(sectionIndex, linkIndex)}
                          className="text-red-500"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    
                    {section.links.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        No links yet. Click "Add Link" to create one.
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {footerSections.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No footer sections yet. Click "Add Section" to create one.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveFooterConfig} disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Footer
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
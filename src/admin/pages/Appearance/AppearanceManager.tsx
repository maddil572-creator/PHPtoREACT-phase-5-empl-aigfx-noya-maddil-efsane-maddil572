import { useState, useEffect } from 'react';
import { Palette, Download, Upload, RotateCcw, Eye, Save, Monitor, Smartphone, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useTheme, THEME_PRESETS, type ThemeConfig } from '@/hooks/useTheme';

const COLOR_CATEGORIES = [
  {
    title: 'Brand Colors',
    description: 'Primary brand colors and accents',
    colors: [
      { key: 'primary_color', label: 'Primary Color', description: 'Main brand color' },
      { key: 'secondary_color', label: 'Secondary Color', description: 'Supporting brand color' },
      { key: 'accent_color', label: 'Accent Color', description: 'Highlight color' },
    ],
  },
  {
    title: 'Status Colors',
    description: 'Colors for different states and feedback',
    colors: [
      { key: 'success_color', label: 'Success', description: 'Success messages and states' },
      { key: 'warning_color', label: 'Warning', description: 'Warning messages and states' },
      { key: 'error_color', label: 'Error', description: 'Error messages and states' },
    ],
  },
  {
    title: 'Background Colors',
    description: 'Background colors for different sections',
    colors: [
      { key: 'background_primary', label: 'Primary Background', description: 'Main page background' },
      { key: 'background_secondary', label: 'Secondary Background', description: 'Card and section backgrounds' },
      { key: 'background_muted', label: 'Muted Background', description: 'Subtle background areas' },
    ],
  },
  {
    title: 'Text Colors',
    description: 'Text colors for different content types',
    colors: [
      { key: 'text_primary', label: 'Primary Text', description: 'Main text color' },
      { key: 'text_secondary', label: 'Secondary Text', description: 'Supporting text color' },
      { key: 'text_muted', label: 'Muted Text', description: 'Subtle text color' },
    ],
  },
];

const TYPOGRAPHY_OPTIONS = [
  'Inter, sans-serif',
  'Roboto, sans-serif',
  'Open Sans, sans-serif',
  'Lato, sans-serif',
  'Montserrat, sans-serif',
  'Poppins, sans-serif',
  'Source Sans Pro, sans-serif',
  'Nunito, sans-serif',
  'Raleway, sans-serif',
  'Playfair Display, serif',
  'Merriweather, serif',
  'Lora, serif',
];

export function AppearanceManager() {
  const { theme, loading, error, updateTheme, resetTheme, exportTheme, importTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('colors');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);
  const [localTheme, setLocalTheme] = useState<ThemeConfig>(theme);

  useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  const handleColorChange = (key: keyof ThemeConfig, value: string) => {
    setLocalTheme(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateTheme(localTheme);
      toast.success('Appearance settings saved successfully');
    } catch (error) {
      toast.error('Failed to save appearance settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePresetApply = async (presetKey: string) => {
    const preset = THEME_PRESETS[presetKey as keyof typeof THEME_PRESETS];
    if (preset) {
      setLocalTheme(preset.theme);
      try {
        await updateTheme(preset.theme);
        toast.success(`Applied ${preset.name} theme`);
      } catch (error) {
        toast.error('Failed to apply theme preset');
      }
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset to default theme? This will lose all customizations.')) {
      try {
        await resetTheme();
        toast.success('Theme reset to defaults');
      } catch (error) {
        toast.error('Failed to reset theme');
      }
    }
  };

  const handleExport = () => {
    const themeData = exportTheme();
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Theme exported successfully');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          await importTheme(content);
          toast.success('Theme imported successfully');
        } catch (error) {
          toast.error('Failed to import theme - invalid format');
        }
      };
      reader.readAsText(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading appearance settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Appearance Manager</h2>
          <p className="text-muted-foreground">Customize your website's visual identity and branding</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open('/', '_blank')}>
            <Eye className="h-4 w-4 mr-2" />
            Preview Site
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme Presets
              </CardTitle>
              <CardDescription>
                Quick start with pre-designed themes or manage your custom themes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(THEME_PRESETS).map(([key, preset]) => (
                  <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{preset.name}</h4>
                          <Button
                            size="sm"
                            onClick={() => handlePresetApply(key)}
                          >
                            Apply
                          </Button>
                        </div>
                        
                        <div className="flex gap-1">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: preset.theme.primary_color }}
                          />
                          <div
                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: preset.theme.secondary_color }}
                          />
                          <div
                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: preset.theme.accent_color }}
                          />
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Primary: {preset.theme.primary_color}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-4 mt-6 pt-6 border-t">
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Theme
                </Button>
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                    id="theme-import"
                  />
                  <Button variant="outline" asChild>
                    <label htmlFor="theme-import" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Theme
                    </label>
                  </Button>
                </div>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Default
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          {COLOR_CATEGORIES.map((category) => (
            <Card key={category.title}>
              <CardHeader>
                <CardTitle>{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.colors.map((color) => (
                    <div key={color.key} className="space-y-2">
                      <Label htmlFor={color.key}>{color.label}</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id={color.key}
                          type="color"
                          value={localTheme[color.key as keyof ThemeConfig] as string}
                          onChange={(e) => handleColorChange(color.key as keyof ThemeConfig, e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={localTheme[color.key as keyof ThemeConfig] as string}
                          onChange={(e) => handleColorChange(color.key as keyof ThemeConfig, e.target.value)}
                          className="flex-1"
                          placeholder="#000000"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{color.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Gradient Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Gradient Colors</CardTitle>
              <CardDescription>Colors for gradient backgrounds and effects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="gradient_start">Gradient Start</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="gradient_start"
                      type="color"
                      value={localTheme.gradient_start}
                      onChange={(e) => handleColorChange('gradient_start', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={localTheme.gradient_start}
                      onChange={(e) => handleColorChange('gradient_start', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradient_end">Gradient End</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="gradient_end"
                      type="color"
                      value={localTheme.gradient_end}
                      onChange={(e) => handleColorChange('gradient_end', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={localTheme.gradient_end}
                      onChange={(e) => handleColorChange('gradient_end', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              
              {/* Gradient Preview */}
              <div className="mt-4">
                <Label>Gradient Preview</Label>
                <div
                  className="w-full h-20 rounded-lg border mt-2"
                  style={{
                    background: `linear-gradient(135deg, ${localTheme.gradient_start}, ${localTheme.gradient_end})`
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Typography Settings</CardTitle>
              <CardDescription>Customize fonts and text styling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="font_primary">Primary Font</Label>
                  <Select
                    value={localTheme.font_primary}
                    onValueChange={(value) => handleColorChange('font_primary', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPOGRAPHY_OPTIONS.map((font) => (
                        <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                          {font.split(',')[0]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="font_secondary">Secondary Font</Label>
                  <Select
                    value={localTheme.font_secondary}
                    onValueChange={(value) => handleColorChange('font_secondary', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPOGRAPHY_OPTIONS.map((font) => (
                        <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                          {font.split(',')[0]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="font_size_base">Base Font Size</Label>
                  <Input
                    id="font_size_base"
                    value={localTheme.font_size_base}
                    onChange={(e) => handleColorChange('font_size_base', e.target.value)}
                    placeholder="16px"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="line_height_base">Base Line Height</Label>
                  <Input
                    id="line_height_base"
                    value={localTheme.line_height_base}
                    onChange={(e) => handleColorChange('line_height_base', e.target.value)}
                    placeholder="1.5"
                  />
                </div>
              </div>

              {/* Typography Preview */}
              <div className="space-y-4 p-4 border rounded-lg">
                <Label>Typography Preview</Label>
                <div style={{ fontFamily: localTheme.font_primary, fontSize: localTheme.font_size_base, lineHeight: localTheme.line_height_base }}>
                  <h1 className="text-3xl font-bold mb-2" style={{ color: localTheme.text_primary }}>
                    Heading Example
                  </h1>
                  <p className="mb-4" style={{ color: localTheme.text_secondary }}>
                    This is an example paragraph showing how your typography settings will look. 
                    The quick brown fox jumps over the lazy dog.
                  </p>
                  <p className="text-sm" style={{ color: localTheme.text_muted }}>
                    This is smaller muted text for captions and secondary information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Layout Settings</CardTitle>
              <CardDescription>Customize spacing, borders, and layout properties</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="border_radius">Border Radius</Label>
                  <Input
                    id="border_radius"
                    value={localTheme.border_radius}
                    onChange={(e) => handleColorChange('border_radius', e.target.value)}
                    placeholder="8px"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="spacing_unit">Spacing Unit</Label>
                  <Input
                    id="spacing_unit"
                    value={localTheme.spacing_unit}
                    onChange={(e) => handleColorChange('spacing_unit', e.target.value)}
                    placeholder="4px"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="border_color">Border Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={localTheme.border_color}
                      onChange={(e) => handleColorChange('border_color', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={localTheme.border_color}
                      onChange={(e) => handleColorChange('border_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shadow_color">Shadow Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={localTheme.shadow_color}
                      onChange={(e) => handleColorChange('shadow_color', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={localTheme.shadow_color}
                      onChange={(e) => handleColorChange('shadow_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Layout Preview */}
              <div className="space-y-4 p-4 border rounded-lg">
                <Label>Layout Preview</Label>
                <div className="space-y-4">
                  <div 
                    className="p-4 border"
                    style={{ 
                      borderRadius: localTheme.border_radius,
                      borderColor: localTheme.border_color,
                      backgroundColor: localTheme.background_secondary
                    }}
                  >
                    <h3 className="font-semibold mb-2" style={{ color: localTheme.text_primary }}>
                      Card Example
                    </h3>
                    <p style={{ color: localTheme.text_secondary }}>
                      This card shows your border radius and spacing settings.
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <div 
                      className="px-4 py-2 text-white"
                      style={{ 
                        backgroundColor: localTheme.primary_color,
                        borderRadius: localTheme.border_radius
                      }}
                    >
                      Primary Button
                    </div>
                    <div 
                      className="px-4 py-2 border"
                      style={{ 
                        borderColor: localTheme.border_color,
                        borderRadius: localTheme.border_radius,
                        color: localTheme.text_primary
                      }}
                    >
                      Secondary Button
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Dark mode and advanced customization options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={localTheme.dark_mode_enabled}
                  onCheckedChange={(checked) => handleColorChange('dark_mode_enabled', checked)}
                />
                <Label>Enable Dark Mode Support</Label>
              </div>

              {localTheme.dark_mode_enabled && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-semibold">Dark Mode Colors</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Dark Primary Color</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="color"
                          value={localTheme.dark_primary_color}
                          onChange={(e) => handleColorChange('dark_primary_color', e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={localTheme.dark_primary_color}
                          onChange={(e) => handleColorChange('dark_primary_color', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Dark Background</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="color"
                          value={localTheme.dark_background}
                          onChange={(e) => handleColorChange('dark_background', e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={localTheme.dark_background}
                          onChange={(e) => handleColorChange('dark_background', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Dark Text Color</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="color"
                          value={localTheme.dark_text_color}
                          onChange={(e) => handleColorChange('dark_text_color', e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={localTheme.dark_text_color}
                          onChange={(e) => handleColorChange('dark_text_color', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <Label>Custom CSS</Label>
                <Textarea
                  placeholder="Add custom CSS rules here..."
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Advanced: Add custom CSS to override or extend the theme styles.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
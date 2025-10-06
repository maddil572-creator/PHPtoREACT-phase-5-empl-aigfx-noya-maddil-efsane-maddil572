import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader as Loader2, Upload, Palette, Save } from 'lucide-react';
import { useSettings, useBulkUpdateSettings, useUploadSettingsFile } from '../../hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface AppearanceSettings {
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  dark_mode_enabled: boolean;
}

export function AppearanceForm() {
  const { data: settings, isLoading } = useSettings();
  const bulkUpdateSettings = useBulkUpdateSettings();
  const uploadFile = useUploadSettingsFile();
  const [isUploading, setIsUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<AppearanceSettings>();

  const darkModeEnabled = watch('dark_mode_enabled');
  const primaryColor = watch('primary_color');
  const secondaryColor = watch('secondary_color');

  useEffect(() => {
    if (settings && Array.isArray(settings)) {
      const settingsMap: any = {};
      settings.forEach((setting: any) => {
        settingsMap[setting.key] = setting.value;
      });

      reset({
        logo_url: settingsMap.logo_url || '',
        primary_color: settingsMap.primary_color || '#3B82F6',
        secondary_color: settingsMap.secondary_color || '#10B981',
        dark_mode_enabled: settingsMap.dark_mode_enabled === 'true' || false,
      });

      setLogoUrl(settingsMap.logo_url || '');
    }
  }, [settings, reset]);

  const onSubmit = async (data: AppearanceSettings) => {
    try {
      const settingsToUpdate = {
        logo_url: { value: data.logo_url, type: 'url' },
        primary_color: { value: data.primary_color, type: 'color' },
        secondary_color: { value: data.secondary_color, type: 'color' },
        dark_mode_enabled: { value: String(data.dark_mode_enabled), type: 'boolean' },
      };

      await bulkUpdateSettings.mutateAsync(settingsToUpdate);
      toast.success('Appearance settings updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update appearance settings');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadFile.mutateAsync(file);
      const url = response.url || response.data?.url;

      if (url) {
        setLogoUrl(url);
        setValue('logo_url', url);
        toast.success('Logo uploaded successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Logo & Branding</CardTitle>
          <CardDescription>
            Customize your site's visual identity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logo">Site Logo</Label>
            <div className="flex items-start gap-4">
              {logoUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={logoUrl}
                    alt="Site Logo"
                    className="w-32 h-32 object-contain rounded border"
                  />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={isUploading}
                />
                <p className="text-sm text-muted-foreground">
                  Recommended: SVG or PNG, max 5MB
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">Logo URL (Manual)</Label>
            <Input
              id="logo_url"
              {...register('logo_url')}
              placeholder="https://example.com/logo.png"
            />
            <p className="text-sm text-muted-foreground">
              Or enter a logo URL directly
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme Colors</CardTitle>
          <CardDescription>
            Customize your brand colors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  {...register('primary_color')}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={primaryColor || '#3B82F6'}
                  onChange={(e) => setValue('primary_color', e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
              {primaryColor && (
                <div
                  className="h-10 rounded border"
                  style={{ backgroundColor: primaryColor }}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary_color">Secondary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="secondary_color"
                  type="color"
                  {...register('secondary_color')}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={secondaryColor || '#10B981'}
                  onChange={(e) => setValue('secondary_color', e.target.value)}
                  placeholder="#10B981"
                  className="flex-1"
                />
              </div>
              {secondaryColor && (
                <div
                  className="h-10 rounded border"
                  style={{ backgroundColor: secondaryColor }}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
          <CardDescription>
            Control display options and features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark_mode">Dark Mode Support</Label>
              <p className="text-sm text-muted-foreground">
                Enable dark mode theme for users
              </p>
            </div>
            <Switch
              id="dark_mode"
              checked={darkModeEnabled}
              onCheckedChange={(checked) => setValue('dark_mode_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="submit"
          disabled={isSubmitting || bulkUpdateSettings.isPending}
        >
          {isSubmitting || bulkUpdateSettings.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Appearance
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

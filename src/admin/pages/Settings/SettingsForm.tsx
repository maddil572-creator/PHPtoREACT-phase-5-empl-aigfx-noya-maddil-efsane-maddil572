import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Upload, Save } from 'lucide-react';
import { useSettings, useBulkUpdateSettings, useUploadSettingsFile } from '../../hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { AppearanceForm } from './AppearanceForm';
import { ProfileForm } from './ProfileForm';

interface GeneralSettings {
  site_name: string;
  site_tagline: string;
  contact_email: string;
  contact_phone: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

export function SettingsForm() {
  const { data: settings, isLoading } = useSettings();
  const bulkUpdateSettings = useBulkUpdateSettings();
  const uploadFile = useUploadSettingsFile();
  const [isUploading, setIsUploading] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<GeneralSettings>();

  useEffect(() => {
    if (settings && Array.isArray(settings)) {
      const settingsMap: any = {};
      settings.forEach((setting: any) => {
        settingsMap[setting.key] = setting.value;
      });

      reset({
        site_name: settingsMap.site_name || '',
        site_tagline: settingsMap.site_tagline || '',
        contact_email: settingsMap.contact_email || '',
        contact_phone: settingsMap.contact_phone || '',
        seo_title: settingsMap.seo_title || '',
        seo_description: settingsMap.seo_description || '',
        seo_keywords: settingsMap.seo_keywords || '',
      });

      setFaviconUrl(settingsMap.favicon_url || '');
    }
  }, [settings, reset]);

  const onSubmit = async (data: GeneralSettings) => {
    try {
      const settingsToUpdate = {
        site_name: { value: data.site_name, type: 'text' },
        site_tagline: { value: data.site_tagline, type: 'text' },
        contact_email: { value: data.contact_email, type: 'email' },
        contact_phone: { value: data.contact_phone, type: 'text' },
        seo_title: { value: data.seo_title, type: 'text' },
        seo_description: { value: data.seo_description, type: 'text' },
        seo_keywords: { value: data.seo_keywords, type: 'text' },
      };

      await bulkUpdateSettings.mutateAsync(settingsToUpdate);
      toast.success('Settings updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadFile.mutateAsync(file);
      const url = response.url || response.data?.url;

      if (url) {
        setFaviconUrl(url);
        await bulkUpdateSettings.mutateAsync({
          favicon_url: { value: url, type: 'url' },
        });
        toast.success('Favicon uploaded successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload favicon');
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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your site settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Basic site information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="site_name">Site Name</Label>
                    <Input
                      id="site_name"
                      {...register('site_name')}
                      placeholder="Your Site Name"
                    />
                    {errors.site_name && (
                      <p className="text-sm text-destructive">{errors.site_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="site_tagline">Site Tagline</Label>
                    <Input
                      id="site_tagline"
                      {...register('site_tagline')}
                      placeholder="Your site tagline"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      {...register('contact_email')}
                      placeholder="contact@example.com"
                    />
                    {errors.contact_email && (
                      <p className="text-sm text-destructive">{errors.contact_email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      {...register('contact_phone')}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>
                  Optimize your site for search engines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seo_title">SEO Title</Label>
                  <Input
                    id="seo_title"
                    {...register('seo_title')}
                    placeholder="Your Site - Tagline"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo_description">SEO Description</Label>
                  <Textarea
                    id="seo_description"
                    {...register('seo_description')}
                    placeholder="A brief description of your site"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo_keywords">SEO Keywords</Label>
                  <Input
                    id="seo_keywords"
                    {...register('seo_keywords')}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                  <p className="text-sm text-muted-foreground">
                    Separate keywords with commas
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Site Assets</CardTitle>
                <CardDescription>
                  Upload favicon and other site assets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="favicon">Favicon</Label>
                  <div className="flex items-center gap-4">
                    {faviconUrl && (
                      <img
                        src={faviconUrl}
                        alt="Favicon"
                        className="w-8 h-8 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <Input
                        id="favicon"
                        type="file"
                        accept="image/*"
                        onChange={handleFaviconUpload}
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recommended: 32x32px or 64x64px, PNG or ICO format
                  </p>
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
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceForm />
        </TabsContent>

        <TabsContent value="profile">
          <ProfileForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * PortfolioForm Component
 * Create/Edit portfolio form with validation
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader as Loader2, Plus, X, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { Portfolio, adminApi } from '../../utils/api';
import { portfolioSchema, PortfolioFormValues } from '../../utils/validation';
import { useCreatePortfolio, useUpdatePortfolio } from '../../hooks/usePortfolio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface PortfolioFormProps {
  portfolio: Portfolio | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const CATEGORIES = [
  'Logo Design',
  'Thumbnail Design',
  'Complete Branding',
  'Video Editing',
  'Web Design',
  'UI/UX Design',
  'Illustration',
  'Animation',
  'Photography',
  'Other',
];

export function PortfolioForm({ portfolio, onSuccess, onCancel }: PortfolioFormProps) {
  const [tagInput, setTagInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const createPortfolio = useCreatePortfolio();
  const updatePortfolio = useUpdatePortfolio();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: portfolio
      ? {
          title: portfolio.title,
          category: portfolio.category,
          description: portfolio.description,
          longDescription: portfolio.longDescription || '',
          client: portfolio.client || '',
          completionDate: portfolio.completionDate || '',
          featuredImage: portfolio.featuredImage,
          images: portfolio.images || [],
          tags: portfolio.tags || [],
          technologies: portfolio.technologies || [],
          projectUrl: portfolio.projectUrl || '',
          featured: portfolio.featured,
          status: portfolio.status,
        }
      : {
          title: '',
          category: '',
          description: '',
          longDescription: '',
          client: '',
          completionDate: '',
          featuredImage: '',
          images: [],
          tags: [],
          technologies: [],
          projectUrl: '',
          featured: false,
          status: 'active',
        },
  });

  const images = watch('images') || [];
  const tags = watch('tags') || [];
  const technologies = watch('technologies') || [];
  const featured = watch('featured');
  const status = watch('status');
  const featuredImage = watch('featuredImage');

  useEffect(() => {
    if (portfolio) {
      reset({
        title: portfolio.title,
        category: portfolio.category,
        description: portfolio.description,
        longDescription: portfolio.longDescription || '',
        client: portfolio.client || '',
        completionDate: portfolio.completionDate || '',
        featuredImage: portfolio.featuredImage,
        images: portfolio.images || [],
        tags: portfolio.tags || [],
        technologies: portfolio.technologies || [],
        projectUrl: portfolio.projectUrl || '',
        featured: portfolio.featured,
        status: portfolio.status,
      });
    }
  }, [portfolio, reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const response = await adminApi.portfolio.uploadImage(file);
      const imageUrl = response.url || response.data?.url;

      if (imageUrl) {
        if (images.length === 0 && !featuredImage) {
          setValue('featuredImage', imageUrl);
        }
        setValue('images', [...images, imageUrl]);
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddImage = () => {
    if (!imageInput.trim()) return;

    try {
      new URL(imageInput);
      if (images.length >= 10) {
        toast.error('Maximum 10 images allowed');
        return;
      }
      setValue('images', [...images, imageInput.trim()]);
      if (images.length === 0 && !featuredImage) {
        setValue('featuredImage', imageInput.trim());
      }
      setImageInput('');
    } catch {
      toast.error('Please enter a valid URL');
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setValue('images', newImages);
    if (featuredImage === images[index]) {
      setValue('featuredImage', newImages[0] || '');
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (tags.length >= 10) {
      toast.error('Maximum 10 tags allowed');
      return;
    }
    if (!tags.includes(tagInput.trim())) {
      setValue('tags', [...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setValue('tags', tags.filter((_, i) => i !== index));
  };

  const handleAddTech = () => {
    if (!techInput.trim()) return;
    if (technologies.length >= 10) {
      toast.error('Maximum 10 technologies allowed');
      return;
    }
    if (!technologies.includes(techInput.trim())) {
      setValue('technologies', [...technologies, techInput.trim()]);
      setTechInput('');
    }
  };

  const handleRemoveTech = (index: number) => {
    setValue('technologies', technologies.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PortfolioFormValues) => {
    try {
      if (portfolio) {
        await updatePortfolio.mutateAsync({ id: portfolio.id, data });
        toast.success('Portfolio updated successfully');
      } else {
        await createPortfolio.mutateAsync(data);
        toast.success('Portfolio created successfully');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save portfolio');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Essential project details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter project title"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={watch('category')}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Client Name</Label>
              <Input
                id="client"
                {...register('client')}
                placeholder="Client or company name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Short Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Brief description (30-1000 characters)"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="longDescription">Detailed Description</Label>
            <Textarea
              id="longDescription"
              {...register('longDescription')}
              placeholder="Detailed project description"
              rows={5}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="completionDate">Completion Date</Label>
              <Input
                id="completionDate"
                type="date"
                {...register('completionDate')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectUrl">Project URL</Label>
              <Input
                id="projectUrl"
                {...register('projectUrl')}
                placeholder="https://example.com"
              />
              {errors.projectUrl && (
                <p className="text-sm text-destructive">{errors.projectUrl.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>Upload or add image URLs (1-10 images required)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Upload Image</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading || images.length >= 10}
              />
              {isUploading && <Loader2 className="h-5 w-5 animate-spin" />}
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <Label>Or Add Image URL</Label>
            <div className="flex gap-2">
              <Input
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                disabled={images.length >= 10}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddImage}
                disabled={images.length >= 10}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {errors.images && (
            <p className="text-sm text-destructive">{errors.images.message}</p>
          )}

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={img}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {img === featuredImage && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      Featured
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tags & Technologies</CardTitle>
          <CardDescription>Add relevant tags and tech stack</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tags (1-10 required)</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                disabled={tags.length >= 10}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddTag}
                disabled={tags.length >= 10}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.tags && (
              <p className="text-sm text-destructive">{errors.tags.message}</p>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <div
                    key={index}
                    className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Technologies (Optional, max 10)</Label>
            <div className="flex gap-2">
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Add a technology"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                disabled={technologies.length >= 10}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddTech}
                disabled={technologies.length >= 10}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {technologies.map((tech, index) => (
                  <div
                    key={index}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(index)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status & Visibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Featured Project</Label>
              <p className="text-sm text-muted-foreground">
                Display this project prominently
              </p>
            </div>
            <Switch
              checked={featured}
              onCheckedChange={(checked) => setValue('featured', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(value: 'active' | 'archived' | 'draft') => setValue('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {portfolio ? 'Update' : 'Create'} Portfolio
        </Button>
      </div>
    </form>
  );
}

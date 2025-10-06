/**
 * TestimonialForm Component
 * Create/Edit testimonial form with validation and star rating
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader as Loader2, Upload, Star } from 'lucide-react';
import { Testimonial, adminApi } from '../../utils/api';
import { testimonialSchema, TestimonialFormValues } from '../../utils/validation';
import { useCreateTestimonial, useUpdateTestimonial } from '../../hooks/useTestimonials';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface TestimonialFormProps {
  testimonial: Testimonial | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TestimonialForm({ testimonial, onSuccess, onCancel }: TestimonialFormProps) {
  const [isUploading, setIsUploading] = useState(false);

  const createTestimonial = useCreateTestimonial();
  const updateTestimonial = useUpdateTestimonial();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: testimonial
      ? {
          name: testimonial.name,
          role: testimonial.role,
          company: testimonial.company || '',
          content: testimonial.content,
          rating: testimonial.rating,
          avatar: testimonial.avatar || '',
          featured: testimonial.featured,
          status: testimonial.status,
        }
      : {
          name: '',
          role: '',
          company: '',
          content: '',
          rating: 5,
          avatar: '',
          featured: false,
          status: 'active',
        },
  });

  const rating = watch('rating');
  const featured = watch('featured');
  const status = watch('status');
  const avatar = watch('avatar');

  useEffect(() => {
    if (testimonial) {
      reset({
        name: testimonial.name,
        role: testimonial.role,
        company: testimonial.company || '',
        content: testimonial.content,
        rating: testimonial.rating,
        avatar: testimonial.avatar || '',
        featured: testimonial.featured,
        status: testimonial.status,
      });
    }
  }, [testimonial, reset]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const response = await adminApi.testimonials.uploadAvatar(file);
      const avatarUrl = response.url || response.data?.url;

      if (avatarUrl) {
        setValue('avatar', avatarUrl);
        toast.success('Avatar uploaded successfully');
      }
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRatingClick = (newRating: number) => {
    setValue('rating', newRating);
  };

  const onSubmit = async (data: TestimonialFormValues) => {
    try {
      if (testimonial) {
        await updateTestimonial.mutateAsync({ id: testimonial.id, data });
        toast.success('Testimonial updated successfully');
      } else {
        await createTestimonial.mutateAsync(data);
        toast.success('Testimonial created successfully');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save testimonial');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Customer details and testimonial content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Customer name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role/Position *</Label>
              <Input
                id="role"
                {...register('role')}
                placeholder="e.g., CEO, Marketing Manager"
              />
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company (Optional)</Label>
            <Input
              id="company"
              {...register('company')}
              placeholder="Company or organization name"
            />
            {errors.company && (
              <p className="text-sm text-destructive">{errors.company.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Testimonial Content *</Label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder="What did the customer say? (30-500 characters)"
              rows={5}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rating & Avatar</CardTitle>
          <CardDescription>Star rating and profile image</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex gap-2 items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating} {rating === 1 ? 'star' : 'stars'}
              </span>
            </div>
            {errors.rating && (
              <p className="text-sm text-destructive">{errors.rating.message}</p>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Avatar Image (Optional)</Label>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                  className="mb-2"
                />
                <Input
                  {...register('avatar')}
                  placeholder="Or enter avatar URL"
                  disabled={isUploading}
                />
                {errors.avatar && (
                  <p className="text-sm text-destructive mt-1">{errors.avatar.message}</p>
                )}
              </div>

              {avatar && (
                <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={avatar}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {isUploading && (
                <Loader2 className="h-5 w-5 animate-spin flex-shrink-0" />
              )}
            </div>
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
              <Label>Featured Testimonial</Label>
              <p className="text-sm text-muted-foreground">
                Display this prominently on the homepage
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
              onValueChange={(value: 'active' | 'archived' | 'pending') => setValue('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
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
          {testimonial ? 'Update' : 'Create'} Testimonial
        </Button>
      </div>
    </form>
  );
}

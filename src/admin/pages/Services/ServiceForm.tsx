/**
 * ServiceForm Component
 * Create/Edit service form with validation
 */

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, X, Trash2 } from 'lucide-react';
import { Service, PricingTier } from '../../utils/api';
import { serviceSchema, ServiceFormValues } from '../../utils/validation';
import { useCreateService, useUpdateService } from '../../hooks/useServices';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface ServiceFormProps {
  service: Service | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const ICON_OPTIONS = [
  { value: '🎨', label: 'Palette (Design)' },
  { value: '▶️', label: 'Play (Video)' },
  { value: '📸', label: 'Camera (Photography)' },
  { value: '✏️', label: 'Pencil (Writing)' },
  { value: '🎬', label: 'Clapper (Film)' },
  { value: '💻', label: 'Laptop (Development)' },
  { value: '📱', label: 'Phone (Mobile)' },
  { value: '🖼️', label: 'Frame (Art)' },
  { value: '🎵', label: 'Music (Audio)' },
  { value: '⚡', label: 'Lightning (Fast)' },
];

export function ServiceForm({ service, onSuccess, onCancel }: ServiceFormProps) {
  const [featureInput, setFeatureInput] = useState('');

  const createService = useCreateService();
  const updateService = useUpdateService();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
    control,
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service
      ? {
          name: service.name,
          tagline: service.tagline,
          description: service.description,
          icon: service.icon,
          features: service.features,
          pricingTiers: service.pricingTiers,
          deliveryTime: service.deliveryTime,
          popular: service.popular,
          active: service.active,
        }
      : {
          name: '',
          tagline: '',
          description: '',
          icon: '🎨',
          features: [],
          pricingTiers: [
            {
              name: 'Basic',
              price: 0,
              duration: '',
              features: [],
              popular: false,
            },
          ],
          deliveryTime: '',
          popular: false,
          active: true,
        },
  });

  const { fields: pricingFields, append: appendPricing, remove: removePricing } = useFieldArray({
    control,
    name: 'pricingTiers',
  });

  const features = watch('features') || [];
  const popular = watch('popular');
  const active = watch('active');

  useEffect(() => {
    if (service) {
      reset({
        name: service.name,
        tagline: service.tagline,
        description: service.description,
        icon: service.icon,
        features: service.features,
        pricingTiers: service.pricingTiers,
        deliveryTime: service.deliveryTime,
        popular: service.popular,
        active: service.active,
      });
    }
  }, [service, reset]);

  const handleAddFeature = () => {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      setValue('features', [...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (featureToRemove: string) => {
    setValue(
      'features',
      features.filter((feature) => feature !== featureToRemove)
    );
  };

  const handleAddPricingTier = () => {
    appendPricing({
      name: '',
      price: 0,
      duration: '',
      features: [],
      popular: false,
    });
  };

  const onSubmit = async (data: ServiceFormValues) => {
    try {
      if (service) {
        await updateService.mutateAsync({ id: service.id, data });
        toast.success('Service updated successfully');
      } else {
        await createService.mutateAsync(data);
        toast.success('Service created successfully');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save service');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Core service details and description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Logo Design"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon *</Label>
            <select
              {...register('icon')}
              className="w-full px-3 py-2 border rounded-md"
            >
              {ICON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value} {option.label}
                </option>
              ))}
            </select>
            {errors.icon && (
              <p className="text-sm text-red-500">{errors.icon.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline *</Label>
            <Input
              id="tagline"
              {...register('tagline')}
              placeholder="Brief catchy description"
            />
            {errors.tagline && (
              <p className="text-sm text-red-500">{errors.tagline.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Detailed service description"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryTime">Delivery Time *</Label>
            <Input
              id="deliveryTime"
              {...register('deliveryTime')}
              placeholder="e.g., 3-5 days"
            />
            {errors.deliveryTime && (
              <p className="text-sm text-red-500">{errors.deliveryTime.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>List of features included in this service</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
              placeholder="Add feature (press Enter)"
            />
            <Button type="button" onClick={handleAddFeature}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {features.map((feature) => (
              <div
                key={feature}
                className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2"
              >
                <span className="text-sm">{feature}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(feature)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          {errors.features && (
            <p className="text-sm text-red-500">{errors.features.message}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Tiers</CardTitle>
          <CardDescription>Define pricing packages for this service</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {pricingFields.map((field, index) => (
            <div key={field.id} className="border p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold">Tier {index + 1}</h4>
                {pricingFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePricing(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tier Name *</Label>
                  <Input
                    {...register(`pricingTiers.${index}.name`)}
                    placeholder="e.g., Basic"
                  />
                  {errors.pricingTiers?.[index]?.name && (
                    <p className="text-sm text-red-500">
                      {errors.pricingTiers[index]?.name?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Price ($) *</Label>
                  <Input
                    type="number"
                    {...register(`pricingTiers.${index}.price`, {
                      valueAsNumber: true,
                    })}
                    placeholder="0"
                  />
                  {errors.pricingTiers?.[index]?.price && (
                    <p className="text-sm text-red-500">
                      {errors.pricingTiers[index]?.price?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Duration *</Label>
                  <Input
                    {...register(`pricingTiers.${index}.duration`)}
                    placeholder="e.g., 3-5 days"
                  />
                  {errors.pricingTiers?.[index]?.duration && (
                    <p className="text-sm text-red-500">
                      {errors.pricingTiers[index]?.duration?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 flex items-center">
                  <Label className="mr-2">Popular Tier</Label>
                  <Switch
                    checked={watch(`pricingTiers.${index}.popular`) || false}
                    onCheckedChange={(checked) =>
                      setValue(`pricingTiers.${index}.popular`, checked)
                    }
                  />
                </div>
              </div>
            </div>
          ))}

          {errors.pricingTiers && (
            <p className="text-sm text-red-500">
              {errors.pricingTiers.message || 'Please fix pricing tier errors'}
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={handleAddPricingTier}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Pricing Tier
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Service visibility and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Switch
                checked={popular}
                onCheckedChange={(checked) => setValue('popular', checked)}
              />
              <Label>Mark as Popular</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={active}
                onCheckedChange={(checked) => setValue('active', checked)}
              />
              <Label>Active</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {service ? 'Update Service' : 'Create Service'}
        </Button>
      </div>
    </form>
  );
}

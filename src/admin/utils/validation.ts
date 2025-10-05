/**
 * Validation schemas for admin forms using Zod
 */

import { z } from 'zod';

export const blogSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),

  excerpt: z
    .string()
    .min(10, 'Excerpt must be at least 10 characters')
    .max(500, 'Excerpt must be less than 500 characters'),

  content: z
    .string()
    .min(50, 'Content must be at least 50 characters'),

  category: z
    .string()
    .min(1, 'Category is required'),

  featured_image: z
    .string()
    .url('Must be a valid URL')
    .or(z.string().length(0)),

  tags: z
    .array(z.string())
    .min(1, 'At least one tag is required')
    .max(10, 'Maximum 10 tags allowed'),

  featured: z
    .boolean()
    .default(false),

  published: z
    .boolean()
    .default(false),

  status: z
    .enum(['draft', 'published', 'archived'])
    .default('draft'),
});

export type BlogFormValues = z.infer<typeof blogSchema>;

export const serviceSchema = z.object({
  name: z
    .string()
    .min(3, 'Service name must be at least 3 characters')
    .max(100, 'Service name must be less than 100 characters'),

  tagline: z
    .string()
    .min(10, 'Tagline must be at least 10 characters')
    .max(150, 'Tagline must be less than 150 characters'),

  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be less than 1000 characters'),

  icon: z
    .string()
    .min(1, 'Icon is required'),

  features: z
    .array(z.string())
    .min(1, 'At least one feature is required')
    .max(15, 'Maximum 15 features allowed'),

  pricingTiers: z
    .array(
      z.object({
        name: z.string().min(1, 'Tier name is required'),
        price: z.number().min(0, 'Price must be 0 or greater'),
        duration: z.string().min(1, 'Duration is required'),
        features: z.array(z.string()),
        popular: z.boolean().optional(),
      })
    )
    .min(1, 'At least one pricing tier is required')
    .max(5, 'Maximum 5 pricing tiers allowed'),

  deliveryTime: z
    .string()
    .min(1, 'Delivery time is required'),

  popular: z
    .boolean()
    .default(false),

  active: z
    .boolean()
    .default(true),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address'),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

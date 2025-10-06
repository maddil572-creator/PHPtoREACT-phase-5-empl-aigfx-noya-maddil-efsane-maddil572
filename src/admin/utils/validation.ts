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

export const portfolioSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),

  category: z
    .string()
    .min(1, 'Category is required'),

  description: z
    .string()
    .min(30, 'Description must be at least 30 characters')
    .max(1000, 'Description must be less than 1000 characters'),

  longDescription: z
    .string()
    .optional(),

  client: z
    .string()
    .optional(),

  completionDate: z
    .string()
    .optional(),

  featuredImage: z
    .string()
    .url('Must be a valid URL')
    .or(z.string().length(0)),

  images: z
    .array(z.string().url('Must be a valid URL'))
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed'),

  tags: z
    .array(z.string())
    .min(1, 'At least one tag is required')
    .max(10, 'Maximum 10 tags allowed'),

  technologies: z
    .array(z.string())
    .max(10, 'Maximum 10 technologies allowed')
    .optional(),

  projectUrl: z
    .string()
    .url('Must be a valid URL')
    .or(z.string().length(0))
    .optional(),

  featured: z
    .boolean()
    .default(false),

  status: z
    .enum(['active', 'archived', 'draft'])
    .default('active'),
});

export type PortfolioFormValues = z.infer<typeof portfolioSchema>;

export const testimonialSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters'),

  role: z
    .string()
    .min(2, 'Role must be at least 2 characters')
    .max(100, 'Role must be less than 100 characters'),

  company: z
    .string()
    .max(100, 'Company name must be less than 100 characters')
    .optional(),

  content: z
    .string()
    .min(30, 'Content must be at least 30 characters')
    .max(500, 'Content must be less than 500 characters'),

  rating: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),

  avatar: z
    .string()
    .url('Must be a valid URL')
    .or(z.string().length(0))
    .optional(),

  featured: z
    .boolean()
    .default(false),

  status: z
    .enum(['active', 'archived', 'pending'])
    .default('active'),
});

export type TestimonialFormValues = z.infer<typeof testimonialSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address'),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

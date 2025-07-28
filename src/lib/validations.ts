import { z } from 'zod';

// Market Price validation schema
export const marketPriceSchema = z.object({
  crop: z.string().min(1, 'Crop is required'),
  market: z.string().min(1, 'Market is required'),
  price: z.number().positive('Price must be positive'),
  currency: z.string().default('D'),
  unit: z.string().min(1, 'Unit is required'),
  date: z.string().min(1, 'Date is required'),
  price_trend: z.enum(['up', 'down', 'stable']).optional(),
  source: z.string().optional(),
  metadata: z.string().optional(),
});

export type MarketPriceInput = z.infer<typeof marketPriceSchema>;

// Event validation schema
export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  event_type: z.string().min(1, 'Event type is required'),
  category: z.string().min(1, 'Category is required'),
  event_date: z.string().min(1, 'Event date is required'),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  registration_url: z.string().url().optional().or(z.literal('')),
  is_free: z.boolean().default(true),
  is_online: z.boolean().default(false),
  status: z.enum(['draft', 'published', 'cancelled']).default('draft'),
  featured: z.boolean().default(false),
  interval: z.string().optional(),
});

export type EventInput = z.infer<typeof eventSchema>;

// Feed Post validation schema
export const feedPostSchema = z.object({
  text: z.string().min(1, 'Post content is required'),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export type FeedPostInput = z.infer<typeof feedPostSchema>;

// User profile validation schema
export const userProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  profile_image_url: z.string().url().optional(),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>; 
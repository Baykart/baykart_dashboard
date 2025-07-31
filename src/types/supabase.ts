// Type definitions for Supabase database schema

export interface User {
  id: string;
  phone: string;
  full_name: string;
  age?: number;
  location?: string;
  farm_area?: number;
  area_unit?: 'Acre' | 'Hectare';
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Farm {
  id: string;
  user_id: string;
  farm_name: string;
  crop: string;
  sowing_date: string;
  area: number;
  area_unit: 'Acre' | 'Hectare';
  location?: string;
  coordinates?: any; // GEOGRAPHY(POINT) type
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  currency: string;
  stock_quantity: number;
  unit: string;
  description?: string;
  sowing_season?: string;
  sowing_method?: string;
  spacing?: string;
  maturity_days?: number;
  image_url?: string;
  is_bestseller: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductRating {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  review?: string;
  verified_buyer: boolean;
  review_date: string;
}

export interface Order {
  id: string;
  order_id: string;
  user_id: string;
  total_amount: number;
  discount_amount: number;
  shipping_amount: number;
  currency: string;
  order_date: string;
  shipping_address: any; // JSONB type
  payment_method: string;
  payment_status: string;
  delivery_status: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface GovernmentScheme {
  id: string;
  title: string;
  category: string;
  state: string;
  description: string;
  brief?: string;
  website_url?: string;
  image_url?: string;
  publish_date: string;
  application_mode?: string;
  eligibility_criteria?: any; // JSONB type
  benefits?: any; // JSONB type
  required_documents?: any; // JSONB type
  created_at: string;
  updated_at: string;
}

export interface MarketPrice {
  id: string;
  crop: string;
  market: string;
  price: number;
  currency: string;
  unit: string;
  date: string;
  price_trend?: 'up' | 'down' | 'stable';
  created_at: string;
}

export interface WeatherData {
  id: string;
  location: string;
  region: string;
  temperature_high: number;
  temperature_low: number;
  condition: string;
  forecast_date: string;
  humidity?: number;
  precipitation?: number;
  wind_speed?: number;
  created_at: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  brief: string;
  content: string;
  source: string;
  category: string;
  image_url?: string;
  publish_date: string;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  source: string;
  category: string;
  thumbnail_url?: string;
  video_url: string;
  duration?: number;
  publish_date: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_type: 'Fair' | 'Expo' | 'Workshop' | 'Training' | 'Other';
  category: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location: string;
  city: string;
  image_url?: string;
  registration_url?: string;
  is_free: boolean;
  is_online: boolean;
  status?: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface CommunityChannel {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  joined_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  channel_id: string;
  content?: string;
  image_url?: string;
  video_url?: string;
  title?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface PostInteraction {
  id: string;
  post_id: string;
  user_id: string;
  interaction_type: 'like' | 'share' | 'comment';
  comment_text?: string;
  created_at: string;
}

export interface UserFollow {
  id: string;
  follower_id: string;
  followed_id: string;
  created_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  added_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_amount?: number;
  discount_percentage?: number;
  minimum_purchase: number;
  currency: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  usage_limit?: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserCoupon {
  id: string;
  user_id: string;
  coupon_id: string;
  is_used: boolean;
  used_at?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  notification_type: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
} 
export interface Feed {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgriService {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  coverage_area: string;
  contact_info: string;
  pricing_notes?: string;
  availability?: string;
  image_url?: string | null;
  is_active: boolean;
  is_verified: boolean;
  date_submitted: string;
  submitted_by?: string | null;
}

export interface AgriServiceCategory {
  id: number;
  name: string;
  description?: string;
}

export type FeedCategory = 'Livestock' | 'Poultry' | 'Aquaculture';

export interface CreateFeedInput {
  name: string;
  category: FeedCategory;
  price: number;
  stock: number;
}

export interface FeedImage {
  id: number;
  image: string; // URL
  uploaded_at: string;
}

export interface FeedComment {
  id: number;
  user: string; // username or display name
  text: string;
  created_at: string;
  updated_at: string;
  parent?: number | null;
  replies?: FeedComment[];
  is_deleted: boolean;
}

export interface FeedLike {
  id: number;
  user: string;
  post?: number;
  comment?: number;
  created_at: string;
}

export type FeedReportReason = 'spam' | 'abuse' | 'misinfo' | 'other';

export interface FeedReport {
  id: number;
  post: number;
  user: string;
  reason: FeedReportReason;
  description: string;
  created_at: string;
  reviewed: boolean;
  reviewed_at?: string | null;
  is_resolved: boolean;
}

export interface FeedPost {
  id: number;
  user: string;
  text: string;
  images: FeedImage[];
  comments: FeedComment[];
  likes_count: number;
  is_liked: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  is_hidden: boolean;
}

// For creating a post
export interface CreateFeedPostInput {
  text: string;
  images?: File[];
}

// For creating a comment
export interface CreateFeedCommentInput {
  post: number;
  text: string;
  parent?: number;
}

// For reporting a post
export interface CreateFeedReportInput {
  reason: FeedReportReason;
  description?: string;
} 
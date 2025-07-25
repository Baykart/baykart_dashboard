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
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
  id: number;
  name: string;
  description: string;
  category: AgriServiceCategory;
  price: number;
  isAvailable: boolean;
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
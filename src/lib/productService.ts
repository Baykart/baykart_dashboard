import { supabase } from '@/lib/supabaseClient';
import { Product, ProductRating } from '../types/supabase';

export interface ProductInput {
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
  is_bestseller?: boolean;
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

export const productService = {
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getProduct(id: string): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getBestsellers(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_bestseller', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};

// Get products by category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('name');

  if (error) {
    console.error(`Error fetching products in category ${category}:`, error);
    throw error;
  }

  return data || [];
};

// Get product ratings
export const getProductRatings = async (productId: string): Promise<ProductRating[]> => {
  const { data, error } = await supabase
    .from('product_ratings')
    .select('*')
    .eq('product_id', productId)
    .order('review_date', { ascending: false });

  if (error) {
    console.error(`Error fetching ratings for product ${productId}:`, error);
    throw error;
  }

  return data || [];
};

// Add a product rating
export const addProductRating = async (
  productId: string, 
  userId: string, 
  rating: number, 
  review?: string
): Promise<ProductRating> => {
  const { data, error } = await supabase
    .from('product_ratings')
    .insert([{
      product_id: productId,
      user_id: userId,
      rating,
      review,
      verified_buyer: true, // This would need logic to verify if user has purchased the product
      review_date: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding product rating:', error);
    throw error;
  }

  return data;
}; 
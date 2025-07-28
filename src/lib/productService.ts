import { supabase } from './supabase';

const API_BASE = `${import.meta.env.VITE_API_URL}/api/v1/`;

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
  category: string;
  category_name: string;
  location: string | null;
  stock_quantity: number;
  sowing_season: string | null;
  sowing_method: string | null;
  maturity_days: number | null;
  status: string;
  stock_unit: string | null;
  compare_price: string | null;
  slug: string | null;
  created_at: string;
  updated_at: string;
  featured: boolean;
  seller: number;
  primary_image: string | null;
  average_rating: number;
  review_count?: number;
}

export interface ProductResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${token}` };
}

export const productService = {
  async getProducts(params?: {
    category?: string;
    search?: string;
    featured?: boolean;
    sort?: string;
    page?: number;
  }): Promise<ProductResponse> {
    try {
      const url = new URL(`${API_BASE}products/`, window.location.origin);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            url.searchParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async getProduct(id: string): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE}products/${id}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}products/`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create product: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}products/${id}/`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update product: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}products/${id}/`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete product: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },
}; 
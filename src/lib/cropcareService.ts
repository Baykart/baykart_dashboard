import { supabase } from './supabase';

const API_BASE = '/api/v1/cropcare/';

export interface CropCareCategory {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CropCareVendor {
  id: string;
  user: string;
  user_email: string;
  name: string;
  contact_phone: string;
  contact_email: string;
  address: string;
  is_verified: boolean;
  business_license: string | null;
  created_at: string;
  updated_at: string;
}

export interface CropCareProduct {
  id: string;
  vendor: string;
  vendor_name: string;
  category: string;
  category_name: string;
  brand: string;
  name: string;
  description: string;
  price: string;
  unit: string;
  stock_quantity: number;
  status: string;
  image_url: string | null;
  specifications: any | null;
  usage_instructions: string | null;
  safety_warnings: string | null;
  is_verified: boolean;
  average_rating: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface CropCareProductRating {
  id: string;
  product: string;
  user: string;
  user_email: string;
  rating: number;
  review: string | null;
  verified_buyer: boolean;
  created_at: string;
  updated_at: string;
}

export interface CropCareCategoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CropCareCategory[];
}

export interface CropCareVendorResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CropCareVendor[];
}

export interface CropCareProductResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CropCareProduct[];
}

export interface CropCareProductRatingResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CropCareProductRating[];
}

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${token}` };
}

export const cropcareService = {
  // Categories
  async getCategories(): Promise<CropCareCategoryResponse> {
    try {
      const response = await fetch(`${API_BASE}categories/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching crop care categories:', error);
      throw error;
    }
  },

  async getCategory(id: string): Promise<CropCareCategory> {
    try {
      const response = await fetch(`${API_BASE}categories/${id}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching crop care category:', error);
      throw error;
    }
  },

  async createCategory(categoryData: Partial<CropCareCategory>): Promise<CropCareCategory> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}categories/`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create crop care category: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating crop care category:', error);
      throw error;
    }
  },

  async updateCategory(id: string, categoryData: Partial<CropCareCategory>): Promise<CropCareCategory> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}categories/${id}/`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update crop care category: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating crop care category:', error);
      throw error;
    }
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}categories/${id}/`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete crop care category: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error deleting crop care category:', error);
      throw error;
    }
  },

  // Vendors
  async getVendors(): Promise<CropCareVendorResponse> {
    try {
      const response = await fetch(`${API_BASE}vendors/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching crop care vendors:', error);
      throw error;
    }
  },

  async getVendor(id: string): Promise<CropCareVendor> {
    try {
      const response = await fetch(`${API_BASE}vendors/${id}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching crop care vendor:', error);
      throw error;
    }
  },

  async createVendor(vendorData: Partial<CropCareVendor>): Promise<CropCareVendor> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}vendors/`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendorData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create crop care vendor: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating crop care vendor:', error);
      throw error;
    }
  },

  async updateVendor(id: string, vendorData: Partial<CropCareVendor>): Promise<CropCareVendor> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}vendors/${id}/`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendorData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update crop care vendor: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating crop care vendor:', error);
      throw error;
    }
  },

  async deleteVendor(id: string): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}vendors/${id}/`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete crop care vendor: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error deleting crop care vendor:', error);
      throw error;
    }
  },

  // Products
  async getProducts(params?: {
    category?: string;
    brand?: string;
    vendor?: string;
    status?: string;
    search?: string;
    sort?: string;
    page?: number;
  }): Promise<CropCareProductResponse> {
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
      console.error('Error fetching crop care products:', error);
      throw error;
    }
  },

  async getProduct(id: string): Promise<CropCareProduct> {
    try {
      const response = await fetch(`${API_BASE}products/${id}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching crop care product:', error);
      throw error;
    }
  },

  async createProduct(productData: Partial<CropCareProduct>): Promise<CropCareProduct> {
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
        throw new Error(`Failed to create crop care product: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating crop care product:', error);
      throw error;
    }
  },

  async updateProduct(id: string, productData: Partial<CropCareProduct>): Promise<CropCareProduct> {
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
        throw new Error(`Failed to update crop care product: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating crop care product:', error);
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
        throw new Error(`Failed to delete crop care product: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error deleting crop care product:', error);
      throw error;
    }
  },

  // Ratings
  async getRatings(productId?: string): Promise<CropCareProductRatingResponse> {
    try {
      const url = new URL(`${API_BASE}ratings/`, window.location.origin);
      if (productId) {
        url.searchParams.append('product', productId);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching crop care ratings:', error);
      throw error;
    }
  },

  async createRating(ratingData: Partial<CropCareProductRating>): Promise<CropCareProductRating> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}ratings/`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create crop care rating: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating crop care rating:', error);
      throw error;
    }
  },
}; 
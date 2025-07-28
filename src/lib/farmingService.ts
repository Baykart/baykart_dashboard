import { supabase } from './supabase';

const API_BASE = `${import.meta.env.VITE_API_URL}/api/v1/farming/`;

export interface FarmingCropCategory {
  id: string;
  name: string;
  description: string | null;
  imageurl: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmingCrop {
  id: string;
  name: string;
  category: string;
  category_display: string;
  icon_url: string | null;
  created_at: string;
}

export interface FarmingCropCategoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FarmingCropCategory[];
}

export interface FarmingCropResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FarmingCrop[];
}

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${token}` };
}

export const farmingService = {
  // Crop Categories
  async getCropCategories(): Promise<FarmingCropCategoryResponse> {
    try {
      const response = await fetch(`${API_BASE}categories/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching crop categories:', error);
      throw error;
    }
  },

  async getCropCategory(id: string): Promise<FarmingCropCategory> {
    try {
      const response = await fetch(`${API_BASE}categories/${id}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching crop category:', error);
      throw error;
    }
  },

  async createCropCategory(categoryData: Partial<FarmingCropCategory>): Promise<FarmingCropCategory> {
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
        throw new Error(`Failed to create crop category: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating crop category:', error);
      throw error;
    }
  },

  async updateCropCategory(id: string, categoryData: Partial<FarmingCropCategory>): Promise<FarmingCropCategory> {
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
        throw new Error(`Failed to update crop category: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating crop category:', error);
      throw error;
    }
  },

  async deleteCropCategory(id: string): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}categories/${id}/`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete crop category: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error deleting crop category:', error);
      throw error;
    }
  },

  // Crops
  async getCrops(params?: {
    category?: string;
    search?: string;
    sort?: string;
    page?: number;
  }): Promise<FarmingCropResponse> {
    try {
      const url = new URL(`${API_BASE}crops/`, window.location.origin);
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
      console.error('Error fetching crops:', error);
      throw error;
    }
  },

  async getCrop(id: string): Promise<FarmingCrop> {
    try {
      const response = await fetch(`${API_BASE}crops/${id}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching crop:', error);
      throw error;
    }
  },

  async createCrop(cropData: Partial<FarmingCrop>): Promise<FarmingCrop> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}crops/`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cropData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create crop: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating crop:', error);
      throw error;
    }
  },

  async updateCrop(id: string, cropData: Partial<FarmingCrop>): Promise<FarmingCrop> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}crops/${id}/`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cropData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update crop: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating crop:', error);
      throw error;
    }
  },

  async deleteCrop(id: string): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}crops/${id}/`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete crop: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error deleting crop:', error);
      throw error;
    }
  },
}; 
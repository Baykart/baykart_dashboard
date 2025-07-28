import { supabase } from './supabase';

const API_BASE = '/api/v1/';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  is_active: boolean;
  image_url: string | null;
}

export interface CategoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Category[];
}

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return { Authorization: `Bearer ${token}` };
}

export const categoryService = {
  async getCategories(): Promise<CategoryResponse> {
    try {
      const response = await fetch(`${API_BASE}categories/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async getCategory(id: string): Promise<Category> {
    try {
      const response = await fetch(`${API_BASE}categories/${id}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  async createCategory(categoryData: Partial<Category>): Promise<Category> {
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
        throw new Error(`Failed to create category: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  async updateCategory(id: string, categoryData: Partial<Category>): Promise<Category> {
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
        throw new Error(`Failed to update category: ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating category:', error);
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
        throw new Error(`Failed to delete category: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },
}; 
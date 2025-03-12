import { supabase } from './supabase';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  imageurl: string | null;
  created_at: string;
}

export interface CategoryInput {
  name: string;
  description?: string | null;
  imageurl?: string | null;
}

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('crop_categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data || [];
};

// Get a single category by ID
export const getCategoryById = async (id: string): Promise<Category | null> => {
  const { data, error } = await supabase
    .from('crop_categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching category with ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Create a new category
export const createCategory = async (category: CategoryInput): Promise<Category> => {
  const { data, error } = await supabase
    .from('crop_categories')
    .insert([category])
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }

  return data;
};

// Update an existing category
export const updateCategory = async (id: string, category: CategoryInput): Promise<Category> => {
  const { data, error } = await supabase
    .from('crop_categories')
    .update(category)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating category with ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Delete a category
export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('crop_categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting category with ID ${id}:`, error);
    throw error;
  }
}; 
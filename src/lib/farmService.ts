import { supabase } from './supabase';
import { Farm } from '../types/supabase';

export interface FarmInput {
  farm_name: string;
  crop: string;
  sowing_date: string;
  area: number;
  area_unit: 'Acre' | 'Hectare';
  location?: string;
  coordinates?: any;
}

// Get all farms for a user
export const getUserFarms = async (userId: string): Promise<Farm[]> => {
  const { data, error } = await supabase
    .from('farms')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching farms:', error);
    throw error;
  }

  return data || [];
};

// Get a single farm by ID
export const getFarmById = async (farmId: string): Promise<Farm | null> => {
  const { data, error } = await supabase
    .from('farms')
    .select('*')
    .eq('id', farmId)
    .single();

  if (error) {
    console.error(`Error fetching farm with ID ${farmId}:`, error);
    throw error;
  }

  return data;
};

// Create a new farm
export const createFarm = async (userId: string, farm: FarmInput): Promise<Farm> => {
  const { data, error } = await supabase
    .from('farms')
    .insert([{ ...farm, user_id: userId }])
    .select()
    .single();

  if (error) {
    console.error('Error creating farm:', error);
    throw error;
  }

  return data;
};

// Update an existing farm
export const updateFarm = async (farmId: string, farm: Partial<FarmInput>): Promise<Farm> => {
  const { data, error } = await supabase
    .from('farms')
    .update(farm)
    .eq('id', farmId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating farm with ID ${farmId}:`, error);
    throw error;
  }

  return data;
};

// Delete a farm
export const deleteFarm = async (farmId: string): Promise<void> => {
  const { error } = await supabase
    .from('farms')
    .delete()
    .eq('id', farmId);

  if (error) {
    console.error(`Error deleting farm with ID ${farmId}:`, error);
    throw error;
  }
};

// Upload farm image
export const uploadFarmImage = async (farmId: string, imageFile: File): Promise<string> => {
  const fileExt = imageFile.name.split('.').pop();
  const fileName = `${farmId}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('farm_images')
    .upload(filePath, imageFile, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Error uploading farm image:', uploadError);
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from('farm_images')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}; 
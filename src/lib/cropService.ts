import { supabase } from './supabase/client';

// Helper function to ensure icon URLs are properly formatted
export const getFormattedIconUrl = (url: string | null): string | null => {
  if (!url) return null;
  
  // If the URL is already a full URL (starts with http or https), return it as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a storage URL without the full path, construct it
  if (url.includes('crop_images/')) {
    const { data } = supabase.storage
      .from('crop_images')
      .getPublicUrl(url.split('crop_images/')[1]);
    return data.publicUrl;
  }
  
  // Otherwise, assume it's just the path and construct the full URL
  const { data } = supabase.storage
    .from('crop_images')
    .getPublicUrl(url);
  
  return data.publicUrl;
};

// Define crop categories as enum
export const CROP_CATEGORIES = [
  'grains',
  'vegetables',
  'fruits',
  'legumes',
  'tubers',
  'cash_crops',
  'other'
] as const;

export type CropCategory = typeof CROP_CATEGORIES[number];

export interface Crop {
  id: string;
  name: string;
  category: CropCategory;
  icon_url: string | null;
  created_at: string;
}

export interface CropInput {
  name: string;
  category: CropCategory;
  icon_url?: string | null;
}

// Get all crops
export const getCrops = async (): Promise<Crop[]> => {
  const { data, error } = await supabase
    .from('crops')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching crops:', error);
    throw error;
  }

  return data || [];
};

// Get crops with formatted URLs
export const getCropsWithFormattedUrls = async (): Promise<Crop[]> => {
  const { data, error } = await supabase
    .from('crops')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching crops:', error);
    throw error;
  }

  // Format icon URLs for all crops
  const formattedData = data?.map(crop => ({
    ...crop,
    icon_url: getFormattedIconUrl(crop.icon_url)
  })) || [];

  return formattedData;
};

// Get a single crop by ID
export const getCropById = async (id: string): Promise<Crop | null> => {
  const { data, error } = await supabase
    .from('crops')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching crop with ID ${id}:`, error);
    throw error;
  }

  if (data) {
    // Format the icon URL
    return {
      ...data,
      icon_url: getFormattedIconUrl(data.icon_url)
    };
  }

  return null;
};

// Create a new crop
export const createCrop = async (crop: CropInput, iconFile?: File): Promise<Crop> => {
  let iconUrl = crop.icon_url;

  // Upload icon if provided
  if (iconFile) {
    try {
      const fileExt = iconFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Check if user is authenticated before upload
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('Authentication required for icon upload');
        console.warn('Unable to upload icon due to authentication. Creating crop without icon.');
      } else {
        // Get the user ID from the session
        const userId = session.user.id;
        
        const { error: uploadError, data } = await supabase.storage
          .from('crop_images')
          .upload(`${userId}/${filePath}`, iconFile, {
            cacheControl: '3600',
            upsert: true // Changed to true to overwrite if file exists
          });

        if (uploadError) {
          console.error('Storage upload error details:', uploadError);
          
          // If bucket doesn't exist or permission denied, just create the crop without the icon
          if (uploadError.message.includes('bucket') || 
              uploadError.message.includes('policy') || 
              uploadError.message.includes('permission') || 
              uploadError.message.includes('Unauthorized')) {
            console.warn('Unable to upload icon due to storage permissions. Creating crop without icon.');
          } else {
            console.error('Error uploading icon:', uploadError);
            throw uploadError;
          }
        } else {
          // Get public URL only if upload was successful
          const { data: publicUrlData } = supabase.storage
            .from('crop_images')
            .getPublicUrl(`${userId}/${filePath}`);

          iconUrl = publicUrlData.publicUrl;
        }
      }
    } catch (error) {
      // Log error but continue with crop creation
      console.error('Error handling icon upload:', error);
      console.warn('Continuing with crop creation without icon.');
    }
  }

  // Create crop with icon URL (or null if upload failed)
  const { data, error } = await supabase
    .from('crops')
    .insert([{ ...crop, icon_url: iconUrl }])
    .select()
    .single();

  if (error) {
    console.error('Error creating crop:', error);
    throw error;
  }

  return data;
};

// Update an existing crop
export const updateCrop = async (id: string, crop: CropInput, iconFile?: File): Promise<Crop> => {
  let iconUrl = crop.icon_url;

  // Upload new icon if provided
  if (iconFile) {
    try {
      const fileExt = iconFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Check if user is authenticated before upload
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('Authentication required for icon upload');
        console.warn('Unable to upload icon due to authentication. Updating crop without new icon.');
      } else {
        // Get the user ID from the session
        const userId = session.user.id;
        
        const { error: uploadError, data } = await supabase.storage
          .from('crop_images')
          .upload(`${userId}/${filePath}`, iconFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error('Storage upload error details:', uploadError);
          
          // If bucket doesn't exist or permission denied, just update the crop without the icon
          if (uploadError.message.includes('bucket') || 
              uploadError.message.includes('policy') || 
              uploadError.message.includes('permission') || 
              uploadError.message.includes('Unauthorized')) {
            console.warn('Unable to upload icon due to storage permissions. Updating crop without new icon.');
          } else {
            console.error('Error uploading icon:', uploadError);
            throw uploadError;
          }
        } else {
          // Get public URL only if upload was successful
          const { data: publicUrlData } = supabase.storage
            .from('crop_images')
            .getPublicUrl(`${userId}/${filePath}`);

          iconUrl = publicUrlData.publicUrl;
        }
      }
    } catch (error) {
      // Log error but continue with crop update
      console.error('Error handling icon upload:', error);
      console.warn('Continuing with crop update without new icon.');
    }
  }

  // Update crop with new data
  const { data, error } = await supabase
    .from('crops')
    .update({ ...crop, icon_url: iconUrl })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating crop with ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Delete a crop
export const deleteCrop = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('crops')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting crop with ID ${id}:`, error);
    throw error;
  }
}; 
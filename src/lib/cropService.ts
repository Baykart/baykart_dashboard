import { supabase } from './supabase/client';

// Helper function to ensure image URLs are properly formatted
export const getFormattedImageUrl = (url: string | null): string | null => {
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

export interface Crop {
  id: string;
  name: string;
  category_id: string;
  image_url: string | null;
  created_at: string;
}

export interface CropInput {
  name: string;
  category_id: string;
  image_url?: string | null;
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

// Get crops with category information
export const getCropsWithCategories = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('crops')
    .select(`
      *,
      crop_categories(name)
    `)
    .order('name');

  if (error) {
    console.error('Error fetching crops with categories:', error);
    throw error;
  }

  // Format image URLs for all crops
  const formattedData = data?.map(crop => ({
    ...crop,
    image_url: getFormattedImageUrl(crop.image_url)
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
    // Format the image URL
    return {
      ...data,
      image_url: getFormattedImageUrl(data.image_url)
    };
  }

  return null;
};

// Create a new crop
export const createCrop = async (crop: CropInput, imageFile?: File): Promise<Crop> => {
  let imageUrl = crop.image_url;

  // Upload image if provided
  if (imageFile) {
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Check if user is authenticated before upload
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('Authentication required for image upload');
        console.warn('Unable to upload image due to authentication. Creating crop without image.');
      } else {
        // Get the user ID from the session
        const userId = session.user.id;
        
        const { error: uploadError, data } = await supabase.storage
          .from('crop_images')
          .upload(`${userId}/${filePath}`, imageFile, {
            cacheControl: '3600',
            upsert: true // Changed to true to overwrite if file exists
          });

        if (uploadError) {
          console.error('Storage upload error details:', uploadError);
          
          // If bucket doesn't exist or permission denied, just create the crop without the image
          if (uploadError.message.includes('bucket') || 
              uploadError.message.includes('policy') || 
              uploadError.message.includes('permission') || 
              uploadError.message.includes('Unauthorized')) {
            console.warn('Unable to upload image due to storage permissions. Creating crop without image.');
          } else {
            console.error('Error uploading image:', uploadError);
            throw uploadError;
          }
        } else {
          // Get public URL only if upload was successful
          const { data: publicUrlData } = supabase.storage
            .from('crop_images')
            .getPublicUrl(`${userId}/${filePath}`);

          imageUrl = publicUrlData.publicUrl;
        }
      }
    } catch (error) {
      // Log error but continue with crop creation
      console.error('Error handling image upload:', error);
      console.warn('Continuing with crop creation without image.');
    }
  }

  // Create crop with image URL (or null if upload failed)
  const { data, error } = await supabase
    .from('crops')
    .insert([{ ...crop, image_url: imageUrl }])
    .select()
    .single();

  if (error) {
    console.error('Error creating crop:', error);
    throw error;
  }

  return data;
};

// Update an existing crop
export const updateCrop = async (id: string, crop: CropInput, imageFile?: File): Promise<Crop> => {
  let imageUrl = crop.image_url;

  // Upload new image if provided
  if (imageFile) {
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Check if user is authenticated before upload
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('Authentication required for image upload');
        console.warn('Unable to upload image due to authentication. Updating crop without new image.');
      } else {
        // Get the user ID from the session
        const userId = session.user.id;
        
        const { error: uploadError, data } = await supabase.storage
          .from('crop_images')
          .upload(`${userId}/${filePath}`, imageFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error('Storage upload error details:', uploadError);
          
          // If bucket doesn't exist or permission denied, just update the crop without the image
          if (uploadError.message.includes('bucket') || 
              uploadError.message.includes('policy') || 
              uploadError.message.includes('permission') || 
              uploadError.message.includes('Unauthorized')) {
            console.warn('Unable to upload image due to storage permissions. Updating crop without new image.');
          } else {
            console.error('Error uploading image:', uploadError);
            throw uploadError;
          }
        } else {
          // Get public URL only if upload was successful
          const { data: publicUrlData } = supabase.storage
            .from('crop_images')
            .getPublicUrl(`${userId}/${filePath}`);

          imageUrl = publicUrlData.publicUrl;
        }
      }
    } catch (error) {
      // Log error but continue with crop update
      console.error('Error handling image upload:', error);
      console.warn('Continuing with crop update without new image.');
    }
  }

  // Update crop with new data
  const { data, error } = await supabase
    .from('crops')
    .update({ ...crop, image_url: imageUrl })
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
  // First get the crop to find the image URL
  const crop = await getCropById(id);
  
  // Delete the record
  const { error } = await supabase
    .from('crops')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting crop with ID ${id}:`, error);
    throw error;
  }

  // If there was an image and it was stored in our bucket, try to delete it
  if (crop?.image_url) {
    try {
      // Check if the URL contains our bucket name to ensure it's from our storage
      if (crop.image_url.includes('crop_images')) {
        const imagePath = crop.image_url.split('/').pop();
        if (imagePath) {
          // Check if user is authenticated before delete
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            console.warn('Authentication required for image deletion. Image file may remain in storage.');
          } else {
            const { error: storageError } = await supabase.storage
              .from('crop_images')
              .remove([imagePath]);
              
            if (storageError) {
              // Just log the error but don't throw - the crop record is already deleted
              console.error('Error deleting image from storage:', storageError);
              console.warn('Crop record deleted but image file may remain in storage.');
            }
          }
        }
      } else {
        console.log('Image URL not from our storage bucket, skipping file deletion');
      }
    } catch (err) {
      console.error('Error parsing image URL for deletion:', err);
    }
  }
}; 
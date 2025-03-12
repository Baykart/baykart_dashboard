import { supabase } from './supabase';
import { Event } from '../types/supabase';

export interface EventInput {
  title: string;
  description?: string;
  event_type: 'Fair' | 'Expo' | 'Workshop' | 'Training' | 'Other';
  category: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location: string;
  city: string;
  registration_url?: string;
  is_free: boolean;
  is_online: boolean;
}

// Get all events
export const getEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }

  return data || [];
};

// Get upcoming events
export const getUpcomingEvents = async (): Promise<Event[]> => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', today)
    .order('event_date', { ascending: true });

  if (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }

  return data || [];
};

// Get events by type
export const getEventsByType = async (eventType: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('event_type', eventType)
    .order('event_date', { ascending: true });

  if (error) {
    console.error(`Error fetching events of type ${eventType}:`, error);
    throw error;
  }

  return data || [];
};

// Get events by category
export const getEventsByCategory = async (category: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('category', category)
    .order('event_date', { ascending: true });

  if (error) {
    console.error(`Error fetching events in category ${category}:`, error);
    throw error;
  }

  return data || [];
};

// Get events by location
export const getEventsByLocation = async (city: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('city', city)
    .order('event_date', { ascending: true });

  if (error) {
    console.error(`Error fetching events in city ${city}:`, error);
    throw error;
  }

  return data || [];
};

// Get a single event by ID
export const getEventById = async (id: string): Promise<Event | null> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching event with ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Create a new event
export const createEvent = async (event: EventInput, imageFile?: File): Promise<Event> => {
  let imageUrl = null;

  // Upload image if provided
  if (imageFile) {
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event_images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('event_images')
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error handling image upload:', error);
      console.warn('Continuing with event creation without image.');
    }
  }

  // Create event with image URL (or null if upload failed)
  const { data, error } = await supabase
    .from('events')
    .insert([{ ...event, image_url: imageUrl }])
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    throw error;
  }

  return data;
};

// Update an existing event
export const updateEvent = async (id: string, event: Partial<EventInput>, imageFile?: File): Promise<Event> => {
  let updates: any = { ...event };

  // Upload new image if provided
  if (imageFile) {
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event_images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('event_images')
        .getPublicUrl(filePath);

      updates.image_url = publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error handling image upload:', error);
      console.warn('Continuing with event update without new image.');
    }
  }

  // Update event with new data
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating event with ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Delete an event
export const deleteEvent = async (id: string): Promise<void> => {
  // First get the event to find the image URL
  const event = await getEventById(id);
  
  // Delete the record
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting event with ID ${id}:`, error);
    throw error;
  }

  // If there was an image and it was stored in our bucket, try to delete it
  if (event?.image_url) {
    try {
      const imagePath = event.image_url.split('/').pop();
      if (imagePath) {
        const { error: storageError } = await supabase.storage
          .from('event_images')
          .remove([imagePath]);
          
        if (storageError) {
          // Just log the error but don't throw - the event record is already deleted
          console.error('Error deleting image:', storageError);
        }
      }
    } catch (err) {
      console.error('Error parsing image URL for deletion:', err);
    }
  }
}; 
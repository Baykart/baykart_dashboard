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

const API_URL = '/api/v1/events/events/';

export const getEvents = async (): Promise<Event[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch events');
  const data = await res.json();
  // DRF paginated response
  return Array.isArray(data.results) ? data.results : data;
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

export const createEvent = async (event: EventInput, imageFile?: File): Promise<Event> => {
  let body: FormData | string;
  let headers: Record<string, string> = {};
  if (imageFile) {
    body = new FormData();
    Object.entries(event).forEach(([k, v]) => body.append(k, v as any));
    body.append('image', imageFile);
  } else {
    body = JSON.stringify(event);
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(API_URL, {
    method: 'POST',
    body,
    headers,
  });
  if (!res.ok) throw new Error('Failed to create event');
  return await res.json();
};

export const updateEvent = async (id: string, event: Partial<EventInput>, imageFile?: File): Promise<Event> => {
  let body: FormData | string;
  let headers: Record<string, string> = {};
  if (imageFile) {
    body = new FormData();
    Object.entries(event).forEach(([k, v]) => body.append(k, v as any));
    body.append('image', imageFile);
  } else {
    body = JSON.stringify(event);
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API_URL}${id}/`, {
    method: 'PUT',
    body,
    headers,
  });
  if (!res.ok) throw new Error('Failed to update event');
  return await res.json();
};

export const deleteEvent = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete event');
}; 
import { Event } from '../types/supabase';
import { getCurrentSession } from './authService';

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

const API_URL = `${import.meta.env.VITE_API_URL || 'https://web-production-f9f0.up.railway.app'}/api/v1/events/events/`;

export const getEvents = async (): Promise<Event[]> => {
  const headers = await getAuthHeaders();
  const res = await fetch(API_URL, { headers });
  if (!res.ok) throw new Error('Failed to fetch events');
  const data = await res.json();
  // DRF paginated response
  return Array.isArray(data.results) ? data.results : data;
};

// Get upcoming events
export const getUpcomingEvents = async (): Promise<Event[]> => {
  const today = new Date().toISOString().split('T')[0];
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}?event_date__gte=${today}`, { headers });
  if (!res.ok) throw new Error('Failed to fetch upcoming events');
  const data = await res.json();
  return Array.isArray(data.results) ? data.results : data;
};

// Get events by type
export const getEventsByType = async (eventType: string): Promise<Event[]> => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}?event_type=${eventType}`, { headers });
  if (!res.ok) throw new Error(`Failed to fetch events of type ${eventType}`);
  const data = await res.json();
  return Array.isArray(data.results) ? data.results : data;
};

// Get events by category
export const getEventsByCategory = async (category: string): Promise<Event[]> => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}?category=${category}`, { headers });
  if (!res.ok) throw new Error(`Failed to fetch events in category ${category}`);
  const data = await res.json();
  return Array.isArray(data.results) ? data.results : data;
};

// Get events by location
export const getEventsByLocation = async (city: string): Promise<Event[]> => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}?city=${city}`, { headers });
  if (!res.ok) throw new Error(`Failed to fetch events in city ${city}`);
  const data = await res.json();
  return Array.isArray(data.results) ? data.results : data;
};

// Get a single event by ID
export const getEventById = async (id: string): Promise<Event | null> => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${id}/`, { headers });
  if (!res.ok) throw new Error(`Failed to fetch event with ID ${id}`);
  return await res.json();
};

export const createEvent = async (event: EventInput, imageFile?: File): Promise<Event> => {
  if (imageFile) {
    const body = new FormData();
    Object.entries(event).forEach(([k, v]) => body.append(k, v as any));
    body.append('image', imageFile);
    const headers = await getAuthHeaders(); // Only the Authorization header
    const res = await fetch(API_URL, {
      method: 'POST',
      body,
      headers,
    });
    if (!res.ok) throw new Error('Failed to create event');
    return await res.json();
  } else {
    // Use JSON for no-image case
    const headers = { ...(await getAuthHeaders()), 'Content-Type': 'application/json' };
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(event),
      headers,
    });
    if (!res.ok) throw new Error('Failed to create event');
    return await res.json();
  }
};

export const updateEvent = async (id: string, event: Partial<EventInput>, imageFile?: File): Promise<Event> => {
  if (imageFile) {
    const body = new FormData();
    Object.entries(event).forEach(([k, v]) => body.append(k, v as any));
    body.append('image', imageFile);
    const headers = await getAuthHeaders(); // Only the Authorization header
    const res = await fetch(`${API_URL}${id}/`, {
      method: 'PUT',
      body,
      headers,
    });
    if (!res.ok) throw new Error('Failed to update event');
    return await res.json();
  } else {
    // Use JSON for no-image case
    const headers = { ...(await getAuthHeaders()), 'Content-Type': 'application/json' };
    const res = await fetch(`${API_URL}${id}/`, {
      method: 'PUT',
      body: JSON.stringify(event),
      headers,
    });
    if (!res.ok) throw new Error('Failed to update event');
    return await res.json();
  }
};

export const deleteEvent = async (id: string): Promise<void> => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${id}/`, { method: 'DELETE', headers });
  if (!res.ok) throw new Error('Failed to delete event');
}; 

async function getAuthHeaders() {
  const session = await getCurrentSession();
  if (!session) throw new Error('Not authenticated');
  console.log('Using access token:', session.access_token); // Debug log
  return {
    Authorization: `Bearer ${session.access_token}`,
  };
} 
import { AgriService } from '@/types/feeds';
import { supabase } from '@/lib/supabase';

const API_BASE = '/api/v1/agriservices/';

export async function uploadAgriServiceImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${fileName}`;
  const { error: uploadError } = await supabase.storage
    .from('agri-service-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
  if (uploadError) throw uploadError;
  const { data: publicUrlData } = supabase.storage
    .from('agri-service-images')
    .getPublicUrl(filePath);
  return publicUrlData.publicUrl;
}

export async function getAgriServices(params?: Record<string, any>): Promise<AgriService[]> {
  const url = new URL(API_BASE, window.location.origin);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v as string));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch agri services');
  return res.json();
}

export async function createAgriService(data: Partial<AgriService>): Promise<AgriService> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to create agri service');
  return res.json();
}

export async function updateAgriService(id: string, data: Partial<AgriService>): Promise<AgriService> {
  const res = await fetch(`${API_BASE}${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to update agri service');
  return res.json();
}

export async function deleteAgriService(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}${id}/`, { method: 'DELETE', credentials: 'include' });
  if (!res.ok) throw new Error('Failed to delete agri service');
}

export async function toggleAgriServiceActive(id: string, is_active: boolean): Promise<AgriService> {
  return updateAgriService(id, { is_active });
}

export async function toggleAgriServiceVerified(id: string, is_verified: boolean): Promise<AgriService> {
  return updateAgriService(id, { is_verified });
}

// For image upload, use the same Supabase Storage logic as content/news (see contentService for reference) 
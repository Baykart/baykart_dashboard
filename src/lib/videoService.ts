import { getCurrentSession } from './authService';

export type Video = {
  id: string;
  title: string;
  description?: string;
  source: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: number;
  is_livestream?: boolean;
  published_at?: string;
  category?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
};

const API_BASE = `${import.meta.env.VITE_API_URL}/api/v1/content/videos/`;

async function getAuthHeaders() {
  const session = await getCurrentSession();
  if (!session) throw new Error('Not authenticated');
  return {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

export const videoService = {
  async getVideos() {
    const res = await fetch(API_BASE, { method: 'GET' });
    if (!res.ok) throw new Error('Failed to fetch videos');
    return res.json();
  },

  async createVideo(video: Omit<Video, 'id'>) {
    const headers = await getAuthHeaders();
    // Convert tags array to comma string if needed
    const payload = { ...video, tags: Array.isArray(video.tags) ? video.tags.join(',') : video.tags };
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create video');
    return res.json();
  },

  async updateVideo(id: string, video: Partial<Video>) {
    const headers = await getAuthHeaders();
    const payload = { ...video, tags: Array.isArray(video.tags) ? video.tags.join(',') : video.tags };
    const res = await fetch(`${API_BASE}${id}/`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update video');
    return res.json();
  },

  async deleteVideo(id: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}${id}/`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error('Failed to delete video');
  },

  async getUploadUrl(filename: string, type: 'video' | 'thumbnail') {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}get_upload_url/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ filename, type }),
    });
    if (!res.ok) throw new Error('Failed to get upload URL');
    return res.json();
  },

  async uploadFileToSupabase(uploadUrl: string, file: File) {
    // Direct upload to Supabase Storage using the signed URL
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });
    if (!res.ok) throw new Error('Failed to upload file to Supabase');
    return true;
  },

  async uploadVideo(file: File) {
    const { upload_url, public_url } = await this.getUploadUrl(file.name, 'video');
    await this.uploadFileToSupabase(upload_url, file);
    return public_url;
  },

  async uploadThumbnail(file: File) {
    const { upload_url, public_url } = await this.getUploadUrl(file.name, 'thumbnail');
    await this.uploadFileToSupabase(upload_url, file);
    return public_url;
  },
}; 
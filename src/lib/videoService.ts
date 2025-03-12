import { supabase } from './supabase';

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

export const videoService = {
  async getVideos() {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createVideo(video: Omit<Video, 'id'>) {
    const { data, error } = await supabase
      .from('videos')
      .insert(video)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateVideo(id: string, video: Partial<Video>) {
    const { data, error } = await supabase
      .from('videos')
      .update(video)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteVideo(id: string) {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async uploadVideo(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(fileName, file);

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  async uploadThumbnail(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('thumbnails')
      .upload(fileName, file);

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('thumbnails')
      .getPublicUrl(fileName);

    return publicUrl;
  }
}; 
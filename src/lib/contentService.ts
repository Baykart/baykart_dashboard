import { supabase } from './supabase';
import { NewsArticle, Video } from '../types/supabase';

export interface NewsArticleInput {
  title: string;
  brief: string;
  content: string;
  source: string;
  category: string;
  publish_date?: string;
}

export interface VideoInput {
  title: string;
  description?: string;
  source: string;
  category: string;
  video_url: string;
  duration?: number;
  publish_date?: string;
}

// NEWS ARTICLES

// Get all news articles
export const getNewsArticles = async (): Promise<NewsArticle[]> => {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .order('publish_date', { ascending: false });

  if (error) {
    console.error('Error fetching news articles:', error);
    throw error;
  }

  return data || [];
};

// Get news articles by category
export const getNewsByCategory = async (category: string): Promise<NewsArticle[]> => {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('category', category)
    .order('publish_date', { ascending: false });

  if (error) {
    console.error(`Error fetching news articles in category ${category}:`, error);
    throw error;
  }

  return data || [];
};

// Get a single news article by ID
export const getNewsArticleById = async (id: string): Promise<NewsArticle | null> => {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching news article with ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Create a new news article
export const createNewsArticle = async (article: NewsArticleInput, imageFile?: File): Promise<NewsArticle> => {
  let imageUrl = null;

  // Upload image if provided
  if (imageFile) {
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('news_images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('news_images')
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error handling image upload:', error);
      console.warn('Continuing with article creation without image.');
    }
  }

  // Create article with image URL (or null if upload failed)
  const { data, error } = await supabase
    .from('news_articles')
    .insert([{ 
      ...article, 
      image_url: imageUrl,
      publish_date: article.publish_date || new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating news article:', error);
    throw error;
  }

  return data;
};

// Update an existing news article
export const updateNewsArticle = async (id: string, article: Partial<NewsArticleInput>, imageFile?: File): Promise<NewsArticle> => {
  let updates: any = { ...article };

  // Upload new image if provided
  if (imageFile) {
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('news_images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('news_images')
        .getPublicUrl(filePath);

      updates.image_url = publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error handling image upload:', error);
      console.warn('Continuing with article update without new image.');
    }
  }

  // Update article with new data
  const { data, error } = await supabase
    .from('news_articles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating news article with ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Delete a news article
export const deleteNewsArticle = async (id: string): Promise<void> => {
  // First get the article to find the image URL
  const article = await getNewsArticleById(id);
  
  // Delete the record
  const { error } = await supabase
    .from('news_articles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting news article with ID ${id}:`, error);
    throw error;
  }

  // If there was an image and it was stored in our bucket, try to delete it
  if (article?.image_url) {
    try {
      const imagePath = article.image_url.split('/').pop();
      if (imagePath) {
        const { error: storageError } = await supabase.storage
          .from('news_images')
          .remove([imagePath]);
          
        if (storageError) {
          // Just log the error but don't throw - the article record is already deleted
          console.error('Error deleting image:', storageError);
        }
      }
    } catch (err) {
      console.error('Error parsing image URL for deletion:', err);
    }
  }
};

// VIDEOS

// Get all videos
export const getVideos = async (): Promise<Video[]> => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('publish_date', { ascending: false });

  if (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }

  return data || [];
};

// Get videos by category
export const getVideosByCategory = async (category: string): Promise<Video[]> => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('category', category)
    .order('publish_date', { ascending: false });

  if (error) {
    console.error(`Error fetching videos in category ${category}:`, error);
    throw error;
  }

  return data || [];
};

// Get a single video by ID
export const getVideoById = async (id: string): Promise<Video | null> => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching video with ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Create a new video
export const createVideo = async (video: VideoInput, thumbnailFile?: File): Promise<Video> => {
  let thumbnailUrl = null;

  // Upload thumbnail if provided
  if (thumbnailFile) {
    try {
      const fileExt = thumbnailFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('video_thumbnails')
        .upload(filePath, thumbnailFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading thumbnail:', uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('video_thumbnails')
        .getPublicUrl(filePath);

      thumbnailUrl = publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error handling thumbnail upload:', error);
      console.warn('Continuing with video creation without thumbnail.');
    }
  }

  // Create video with thumbnail URL (or null if upload failed)
  const { data, error } = await supabase
    .from('videos')
    .insert([{ 
      ...video, 
      thumbnail_url: thumbnailUrl,
      publish_date: video.publish_date || new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating video:', error);
    throw error;
  }

  return data;
};

// Update an existing video
export const updateVideo = async (id: string, video: Partial<VideoInput>, thumbnailFile?: File): Promise<Video> => {
  let updates: any = { ...video };

  // Upload new thumbnail if provided
  if (thumbnailFile) {
    try {
      const fileExt = thumbnailFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('video_thumbnails')
        .upload(filePath, thumbnailFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading thumbnail:', uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('video_thumbnails')
        .getPublicUrl(filePath);

      updates.thumbnail_url = publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error handling thumbnail upload:', error);
      console.warn('Continuing with video update without new thumbnail.');
    }
  }

  // Update video with new data
  const { data, error } = await supabase
    .from('videos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating video with ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Delete a video
export const deleteVideo = async (id: string): Promise<void> => {
  // First get the video to find the thumbnail URL
  const video = await getVideoById(id);
  
  // Delete the record
  const { error } = await supabase
    .from('videos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting video with ID ${id}:`, error);
    throw error;
  }

  // If there was a thumbnail and it was stored in our bucket, try to delete it
  if (video?.thumbnail_url) {
    try {
      const thumbnailPath = video.thumbnail_url.split('/').pop();
      if (thumbnailPath) {
        const { error: storageError } = await supabase.storage
          .from('video_thumbnails')
          .remove([thumbnailPath]);
          
        if (storageError) {
          // Just log the error but don't throw - the video record is already deleted
          console.error('Error deleting thumbnail:', storageError);
        }
      }
    } catch (err) {
      console.error('Error parsing thumbnail URL for deletion:', err);
    }
  }
}; 
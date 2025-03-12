import { supabase } from './supabase';
import type { Article, CreateArticleDTO, UpdateArticleDTO } from './types';

const BUCKET_NAME = 'news_images';

const processBase64Image = async (base64String: string) => {
  // Extract the actual base64 data from the data URL
  const base64Data = base64String.split(',')[1];
  // Convert base64 to blob
  const byteCharacters = atob(base64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: 'image/jpeg' });
};

export const articleService = {
  async getArticles() {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Article[];
  },

  async getArticleById(id: string) {
    const { data, error } = await supabase
      .from('news_articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Article;
  },

  async createArticle(article: CreateArticleDTO) {
    let image_url = article.image_url;

    if (image_url && image_url.startsWith('data:')) {
      try {
        // Generate a unique filename
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        
        // Convert base64 to blob
        const blob = await processBase64Image(image_url);

        // Upload the image
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName);
        
        image_url = data.publicUrl;
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
    }

    const { data, error } = await supabase
      .from('news_articles')
      .insert([{ ...article, image_url }])
      .select()
      .single();

    if (error) throw error;
    return data as Article;
  },

  async updateArticle(id: string, article: UpdateArticleDTO) {
    let image_url = article.image_url;

    if (image_url && image_url.startsWith('data:')) {
      try {
        // Delete old image if exists
        const { data: oldArticle } = await supabase
          .from('news_articles')
          .select('image_url')
          .eq('id', id)
          .single();

        if (oldArticle?.image_url) {
          const oldFileName = oldArticle.image_url.split('/').pop();
          if (oldFileName) {
            await supabase.storage
              .from(BUCKET_NAME)
              .remove([oldFileName]);
          }
        }

        // Generate a unique filename
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        
        // Convert base64 to blob
        const blob = await processBase64Image(image_url);

        // Upload the new image
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName);
        
        image_url = data.publicUrl;
      } catch (error) {
        console.error('Error updating image:', error);
        throw error;
      }
    }

    const { data, error } = await supabase
      .from('news_articles')
      .update({ ...article, image_url })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Article;
  },

  async deleteArticle(id: string) {
    try {
      // Get the article to delete its image if exists
      const { data: article } = await supabase
        .from('news_articles')
        .select('image_url')
        .eq('id', id)
        .single();

      if (article?.image_url) {
        const fileName = article.image_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from(BUCKET_NAME)
            .remove([fileName]);
        }
      }

      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  }
}; 
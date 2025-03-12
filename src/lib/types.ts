export type Article = {
  id: string;
  title: string;
  brief: string;
  content: string;
  source: string;
  category: string;
  image_url?: string | null;
  publish_date: string;
  created_at?: string | null;
  updated_at?: string | null;
  tags?: string[] | null;
}

export type CreateArticleDTO = Omit<Article, 'id' | 'created_at' | 'updated_at'>;
export type UpdateArticleDTO = Partial<CreateArticleDTO>; 
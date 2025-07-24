import type { Article, CreateArticleDTO, UpdateArticleDTO } from './types';

const API_URL = 'http://localhost:8000/api/v1/content/news_articles/';

export const articleService = {
  async getArticles(page = 1, pageSize = 10) {
    const url = new URL(API_URL);
    url.searchParams.append('page', String(page));
    url.searchParams.append('page_size', String(pageSize));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch articles');
    const data = await res.json();
    if (Array.isArray(data)) {
      return { results: data, count: data.length, next: null, previous: null };
    }
    if (Array.isArray(data.results)) {
      return {
        results: data.results,
        count: data.count,
        next: data.next,
        previous: data.previous,
      };
    }
    return { results: [], count: 0, next: null, previous: null };
  },

  async getArticleById(id: string) {
    const res = await fetch(`${API_URL}${id}/`);
    if (!res.ok) throw new Error('Failed to fetch article');
    return await res.json();
  },

  async createArticle(article: CreateArticleDTO) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(article),
    });
    if (!res.ok) throw new Error('Failed to create article');
    return await res.json();
  },

  async updateArticle(id: string, article: UpdateArticleDTO) {
    const res = await fetch(`${API_URL}${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(article),
    });
    if (!res.ok) throw new Error('Failed to update article');
    return await res.json();
  },

  async deleteArticle(id: string) {
    const res = await fetch(`${API_URL}${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete article');
    return true;
  },
}; 
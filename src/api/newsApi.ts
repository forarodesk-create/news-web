import { apiClient } from '../services/apiClient';
import { normalizeResponse, NormalizedNewsResponse } from '../services/newsMapper';
import { NewsItem } from '../types';

export interface FetchNewsParams {
  category?: string;
  q?: string;
  page?: string;
  signal?: AbortSignal;
}

export const newsApi = {
  async fetchNews(params: FetchNewsParams = {}): Promise<NormalizedNewsResponse> {
    const apiParams: Record<string, string | number | boolean | undefined | null> = {};

    const CATEGORY_MAP: Record<string, string> = {
      national: 'top',
      politics: 'politics',
      economy: 'business',
      sports: 'sports',
      entertainment: 'entertainment',
      tech: 'technology',
      opinion: 'top'
    };

    if (params.category && params.category !== 'all') {
      const apiCategory = CATEGORY_MAP[params.category] || params.category;
      apiParams.category = apiCategory;
    }

    if (params.q && params.q.trim()) {
      apiParams.q = params.q.trim();
    }

    if (params.page) {
      apiParams.page = params.page;
    }

    // Auto-detect NewsData.io and supply mandatory filters to prevent 422 Unprocessable Entity
    const baseUrl = (import.meta as any).env.VITE_API_BASE_URL || (import.meta as any).env.VITE_NEWS_API_URL || '';
    if (baseUrl.toLowerCase().includes('newsdata.io')) {
      apiParams.language = 'bn';
    }

    // Requests go strictly through apiClient
    const rawData = await apiClient.get<unknown>('', {
      params: apiParams,
      signal: params.signal
    });

    return normalizeResponse(rawData);
  },

  // Home News (All/General)
  async fetchHomeNews(page?: string, signal?: AbortSignal): Promise<NormalizedNewsResponse> {
    return this.fetchNews({ category: 'all', page, signal });
  },

  // Latest News
  async fetchLatestNews(page?: string, signal?: AbortSignal): Promise<NormalizedNewsResponse> {
    return this.fetchNews({ page, signal });
  },

  // Breaking News
  async fetchBreakingNews(signal?: AbortSignal): Promise<NewsItem[]> {
    const response = await this.fetchNews({ category: 'all', signal });
    return response.articles.slice(0, 5);
  },

  // Category News
  async fetchCategoryNews(category: string, page?: string, signal?: AbortSignal): Promise<NormalizedNewsResponse> {
    return this.fetchNews({ category, page, signal });
  },

  // Search News
  async fetchSearchNews(query: string, page?: string, signal?: AbortSignal): Promise<NormalizedNewsResponse> {
    return this.fetchNews({ q: query, page, signal });
  },

  // Single News by ID
  async fetchSingleNews(id: string, signal?: AbortSignal): Promise<NewsItem | null> {
    try {
      const rawData = await apiClient.get<unknown>(`/${id}`, { signal });
      const normalized = normalizeResponse(rawData);
      if (normalized.articles.length > 0) {
        return normalized.articles[0];
      }
    } catch {
      // Fallback if detail endpoint is not supported by backend
    }

    // Fallback: search in primary list
    const response = await this.fetchHomeNews(undefined, signal);
    const item = response.articles.find(article => article.id === id);
    return item || null;
  }
};

import { NewsItem } from '../types';

export interface ApiArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  image: string | null;
  source: string;
  publishedAt: string;
  timeAgo: string;
  category: string[];
}

export interface ApiResponse {
  success: boolean;
  cached?: boolean;
  articles: ApiArticle[];
  nextPage: string | null;
  message?: string;
}

const CATEGORY_MAP: Record<string, string> = {
  national: 'top',
  politics: 'politics',
  economy: 'business',
  sports: 'sports',
  entertainment: 'entertainment',
  tech: 'technology',
  opinion: 'top' // fallback to top since opinion doesn't exist directly on the API
};

export function mapArticleToNewsItem(article: ApiArticle): NewsItem {
  // Determine primary category
  let appCategory = 'national';
  if (article.category && article.category.length > 0) {
    const rawCat = article.category[0].toLowerCase();
    if (rawCat === 'sports' || rawCat === 'sport') appCategory = 'sports';
    else if (rawCat === 'politics') appCategory = 'politics';
    else if (rawCat === 'business' || rawCat === 'economy') appCategory = 'economy';
    else if (rawCat === 'entertainment') appCategory = 'entertainment';
    else if (rawCat === 'technology' || rawCat === 'tech') appCategory = 'tech';
    else if (rawCat === 'opinion') appCategory = 'opinion';
  }

  // Generate stable pseudorandom metrics based on a simple string hash of article ID
  const idStr = article.id || article.url || '';
  let charSum = 0;
  for (let i = 0; i < idStr.length; i++) {
    charSum += idStr.charCodeAt(i);
  }
  if (charSum === 0) charSum = Math.floor(Math.random() * 1000) + 1;

  const reads = 120 + (charSum % 880);
  const likes = 20 + (charSum % 180);
  const loves = 10 + (charSum % 90);
  const hahas = charSum % 8;
  const wows = charSum % 12;
  const sads = charSum % 4;
  const angrys = charSum % 3;

  return {
    id: article.id || article.url || String(charSum),
    title: article.title,
    summary: article.description || article.title,
    content: article.description || article.title,
    category: appCategory,
    imageUrl: article.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
    date: article.timeAgo || 'কিছুক্ষণ আগে',
    author: article.source || 'অনলাইন ডেস্ক',
    reads,
    reactions: {
      like: likes,
      love: loves,
      haha: hahas,
      wow: wows,
      sad: sads,
      angry: angrys
    },
    commentsCount: charSum % 10
  };
}

export async function fetchNewsFromApi(params: {
  category?: string;
  q?: string;
  page?: string;
}): Promise<{ articles: NewsItem[]; nextPage: string | null }> {
  const baseUrl = (import.meta as any).env?.VITE_NEWS_API_URL || '';
  if (!baseUrl) {
    throw new Error('VITE_NEWS_API_URL configuration is missing. Please set VITE_NEWS_API_URL in your environment or Settings panel.');
  }

  const url = new URL(baseUrl);
  
  if (params.category && params.category !== 'all') {
    const apiCategory = CATEGORY_MAP[params.category] || params.category;
    url.searchParams.append('category', apiCategory);
  }
  
  if (params.q && params.q.trim()) {
    url.searchParams.append('q', params.q.trim());
  }
  
  if (params.page) {
    url.searchParams.append('page', params.page);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: ApiResponse = await response.json();

  if (data.success === false) {
    throw new Error(data.message || 'Failed to fetch news from API');
  }

  const mappedArticles = (data.articles || []).map(mapArticleToNewsItem);
  return {
    articles: mappedArticles,
    nextPage: data.nextPage || null
  };
}

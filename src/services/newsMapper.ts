import { NewsItem } from '../types';

export interface NewsDataArticle {
  article_id?: string;
  id?: string;
  title?: string | null;
  link?: string | null;
  creator?: string[] | string | null;
  description?: string | null;
  content?: string | null;
  pubDate?: string | null;
  image_url?: string | null;
  source_id?: string | null;
  category?: string[] | string | null;
  language?: string | null;
}

export interface NewsDataResponse {
  status?: string;
  totalResults?: number;
  results?: NewsDataArticle[];
  nextPage?: string | number | null;
}

export interface FootballArticle {
  id?: string;
  title?: string | null;
  description?: string | null;
  url?: string | null;
  image?: string | null;
  source?: string | null;
  publishedAt?: string | null;
  timeAgo?: string | null;
  category?: string[] | string | null;
}

export interface FootballResponse {
  success?: boolean;
  cached?: boolean;
  articles?: FootballArticle[];
  nextPage?: string | null;
  message?: string;
}

export interface NormalizedNewsResponse {
  articles: NewsItem[];
  nextPage: string | null;
}

// Map categories from APIs to our standard app categories
function normalizeCategory(apiCategories: string[] | string | undefined | null): string {
  if (!apiCategories) return 'national';
  
  const cats = Array.isArray(apiCategories) 
    ? apiCategories 
    : typeof apiCategories === 'string' 
      ? [apiCategories] 
      : [];

  if (cats.length === 0) return 'national';

  const rawCat = cats[0].toLowerCase();

  if (rawCat.includes('sport')) return 'sports';
  if (rawCat.includes('politic')) return 'politics';
  if (rawCat.includes('business') || rawCat.includes('econom') || rawCat.includes('finance')) return 'economy';
  if (rawCat.includes('entertainment') || rawCat.includes('showbiz') || rawCat.includes('movie') || rawCat.includes('music')) return 'entertainment';
  if (rawCat.includes('technology') || rawCat.includes('tech') || rawCat.includes('science')) return 'tech';
  if (rawCat.includes('opinion') || rawCat.includes('editorial')) return 'opinion';
  if (rawCat.includes('national') || rawCat.includes('top') || rawCat.includes('world')) return 'national';

  return 'national';
}

function generateStableMetrics(idStr: string): {
  reads: number;
  commentsCount: number;
  reactions: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
} {
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
    reads,
    commentsCount: charSum % 10,
    reactions: {
      like: likes,
      love: loves,
      haha: hahas,
      wow: wows,
      sad: sads,
      angry: angrys
    }
  };
}

export function mapNewsDataArticleToNewsItem(article: NewsDataArticle): NewsItem {
  const id = article.article_id || article.id || String(Math.random());
  const metrics = generateStableMetrics(id);

  // Author normalization
  let author = 'অনলাইন ডেস্ক';
  if (article.creator) {
    if (Array.isArray(article.creator) && article.creator.length > 0) {
      author = article.creator[0];
    } else if (typeof article.creator === 'string') {
      author = article.creator;
    }
  } else if (article.source_id) {
    author = article.source_id;
  }

  // Date normalization
  const date = article.pubDate || 'কিছুক্ষণ আগে';

  // Fallback images
  const imageUrl = article.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80';

  // Title & description safe fallback
  const title = article.title || 'শিরোনামহীন সংবাদ';
  const summary = article.description || article.content || title;
  const content = article.content || article.description || title;

  return {
    id,
    title,
    summary,
    content,
    category: normalizeCategory(article.category),
    imageUrl,
    date,
    author,
    ...metrics
  };
}

export function mapFootballArticleToNewsItem(article: FootballArticle): NewsItem {
  const id = article.id || article.url || String(Math.random());
  const metrics = generateStableMetrics(id);

  const author = article.source || 'অনলাইন ডেস্ক';
  const date = article.timeAgo || article.publishedAt || 'কিছুক্ষণ আগে';
  const imageUrl = article.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80';

  const title = article.title || 'শিরোনামহীন সংবাদ';
  const summary = article.description || title;
  const content = article.description || title;

  return {
    id,
    title,
    summary,
    content,
    category: normalizeCategory(article.category),
    imageUrl,
    date,
    author,
    ...metrics
  };
}

export function normalizeResponse(rawResponse: unknown): NormalizedNewsResponse {
  if (!rawResponse || typeof rawResponse !== 'object') {
    return { articles: [], nextPage: null };
  }

  const obj = rawResponse as Record<string, unknown>;

  // 1. Detect NewsData.io
  if ('results' in obj && Array.isArray(obj.results)) {
    const newsDataResponse = rawResponse as NewsDataResponse;
    const articles = (newsDataResponse.results || [])
      .map(mapNewsDataArticleToNewsItem);
    
    let nextPage: string | null = null;
    if (newsDataResponse.nextPage !== undefined && newsDataResponse.nextPage !== null) {
      nextPage = String(newsDataResponse.nextPage);
    }

    return {
      articles,
      nextPage
    };
  }

  // 2. Detect Football Backend Format (or similar format with "articles")
  if ('articles' in obj && Array.isArray(obj.articles)) {
    const footballResponse = rawResponse as FootballResponse;
    const articles = (footballResponse.articles || [])
      .map(mapFootballArticleToNewsItem);
    
    return {
      articles,
      nextPage: footballResponse.nextPage || null
    };
  }

  // 3. Fallback: Direct Array
  if (Array.isArray(rawResponse)) {
    const articles = (rawResponse as FootballArticle[]).map(mapFootballArticleToNewsItem);
    return { articles, nextPage: null };
  }

  // 4. Default empty fallback
  return { articles: [], nextPage: null };
}

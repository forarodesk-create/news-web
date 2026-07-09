import { useState, useEffect, useCallback } from 'react';
import { NewsItem } from '../types';
import { fetchNewsFromApi } from '../services/newsApi';
import { INITIAL_NEWS_DATA } from '../data/newsData';

export interface UseNewsOptions {
  category?: string;
  q?: string;
}

export function useNews(options: UseNewsOptions = {}) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);

  const { category, q } = options;

  const fetchNews = useCallback(async (isLoadMore = false) => {
    if (isLoadMore && !nextPage) return;

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const pageToken = isLoadMore ? nextPage || undefined : undefined;
      const result = await fetchNewsFromApi({
        category,
        q,
        page: pageToken
      });

      setNews(prev => {
        if (isLoadMore) {
          // Merge unique items by id
          const existingIds = new Set(prev.map(item => item.id));
          const uniqueNewItems = result.articles.filter(item => !existingIds.has(item.id));
          return [...prev, ...uniqueNewItems];
        }
        return result.articles;
      });
      setNextPage(result.nextPage);
      setIsUsingFallback(false);
    } catch (err: any) {
      console.error('Error fetching news from API, falling back to local database:', err);
      
      if (!isLoadMore) {
        // Filter the initial mock news data by category and search query
        const query = (q || '').toLowerCase().trim();
        const filteredFallback = INITIAL_NEWS_DATA.filter(item => {
          if (category && category !== 'all' && item.category !== category) {
            return false;
          }
          if (query) {
            return (
              item.title.toLowerCase().includes(query) ||
              item.summary.toLowerCase().includes(query) ||
              item.content.toLowerCase().includes(query) ||
              item.author.toLowerCase().includes(query)
            );
          }
          return true;
        });

        setNews(filteredFallback);
        setNextPage(null);
        setIsUsingFallback(true);
        // We set error to null because we fell back successfully to local data, keeping the app functional
        setError(null);
      } else {
        setError(err.message || 'খবর লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, q, nextPage]);

  // Fetch news when category or search query changes
  useEffect(() => {
    fetchNews(false);
  }, [category, q]);

  const refetch = useCallback(() => {
    fetchNews(false);
  }, [fetchNews]);

  const loadMore = useCallback(() => {
    if (nextPage && !loadingMore) {
      fetchNews(true);
    }
  }, [nextPage, loadingMore, fetchNews]);

  return {
    news,
    loading,
    error,
    refetch,
    hasMore: !!nextPage,
    loadingMore,
    loadMore,
    isUsingFallback
  };
}

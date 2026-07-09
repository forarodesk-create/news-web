import { useState, useEffect, useCallback, useRef } from 'react';
import { NewsItem } from '../types';
import { newsApi } from '../api/newsApi';
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
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchNewsItems = useCallback(async (isLoadMore = false) => {
    // Abort active request to prevent race conditions & duplicate fetches
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const pageToFetch = isLoadMore ? (nextPage || undefined) : undefined;
      const result = await newsApi.fetchNews({
        category,
        q,
        page: pageToFetch,
        signal: controller.signal
      });

      setNews(prev => {
        if (isLoadMore) {
          // De-duplicate items by id
          const existingIds = new Set(prev.map(item => item.id));
          const newItems = result.articles.filter(item => !existingIds.has(item.id));
          return [...prev, ...newItems];
        }
        return result.articles;
      });
      setNextPage(result.nextPage);
      setIsUsingFallback(false);
      setError(null);
    } catch (err: any) {
      // Ignore abort errors from our own controller cancellation
      if (err.name === 'AbortError' || err.message === 'Request was cancelled.') {
        return;
      }

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
        setError(null); // fell back successfully to local offline archive, keeping app functional
      } else {
        setError(err.message || 'খবর লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
    } finally {
      // Only transition loading states if this request was not cancelled
      if (abortControllerRef.current === controller) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [category, q, nextPage]);

  // Initial fetch triggers on option changes
  useEffect(() => {
    fetchNewsItems(false);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [category, q]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !nextPage) return;
    fetchNewsItems(true);
  }, [loading, loadingMore, nextPage, fetchNewsItems]);

  const refetch = useCallback(() => {
    return fetchNewsItems(false);
  }, [fetchNewsItems]);

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

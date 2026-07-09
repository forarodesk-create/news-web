import { useState, useEffect, useCallback, useRef } from 'react';
import { NewsItem } from '../types';
import { newsApi } from '../api/newsApi';

export function useSearch(initialQuery = '') {
  const [query, setQuery] = useState<string>(initialQuery);
  const [results, setResults] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await newsApi.fetchSearchNews(searchQuery, undefined, controller.signal);
      setResults(response.articles);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'অনুসন্ধান করতে সমস্যা হয়েছে।');
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    search(query);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, search]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    triggerSearch: search
  };
}

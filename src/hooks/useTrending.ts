import { useState, useEffect, useRef } from 'react';
import { NewsItem } from '../types';
import { newsApi } from '../api/newsApi';

export function useTrending() {
  const [trending, setTrending] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    async function loadTrending() {
      setLoading(true);
      try {
        const response = await newsApi.fetchNews({ category: 'all', signal: controller.signal });
        // Sort by reads or reactions to determine trending news
        const sorted = [...response.articles].sort((a, b) => b.reads - a.reads);
        setTrending(sorted.slice(0, 5));
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'ট্রেন্ডিং খবর লোড করতে সমস্যা হয়েছে।');
      } finally {
        if (abortControllerRef.current === controller) {
          setLoading(false);
        }
      }
    }

    loadTrending();

    return () => {
      controller.abort();
    };
  }, []);

  return { trending, loading, error };
}

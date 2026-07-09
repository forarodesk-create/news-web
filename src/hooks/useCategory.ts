import { useState, useEffect, useRef } from 'react';
import { categoryApi, Category } from '../api/categoryApi';

export function useCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    async function loadCategories() {
      setLoading(true);
      setError(null);
      try {
        const result = await categoryApi.fetchCategories(controller.signal);
        setCategories(result);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'ক্যাটেগরি লোড করতে সমস্যা হয়েছে।');
      } finally {
        if (abortControllerRef.current === controller) {
          setLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      controller.abort();
    };
  }, []);

  return { categories, loading, error };
}

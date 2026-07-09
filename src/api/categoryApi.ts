import { apiClient } from '../services/apiClient';

export interface Category {
  id: string;
  nameBangla: string;
  nameEnglish: string;
}

export const categoryApi = {
  async fetchCategories(signal?: AbortSignal): Promise<Category[]> {
    const defaultCategories: Category[] = [
      { id: 'all', nameBangla: 'সর্বশেষ', nameEnglish: 'Latest' },
      { id: 'national', nameBangla: 'জাতীয়', nameEnglish: 'National' },
      { id: 'politics', nameBangla: 'রাজনীতি', nameEnglish: 'Politics' },
      { id: 'economy', nameBangla: 'অর্থনীতি', nameEnglish: 'Economy' },
      { id: 'sports', nameBangla: 'খেলাধুলা', nameEnglish: 'Sports' },
      { id: 'entertainment', nameBangla: 'বিনোদন', nameEnglish: 'Entertainment' },
      { id: 'tech', nameBangla: 'তথ্যপ্রযুক্তি', nameEnglish: 'Tech' },
      { id: 'opinion', nameBangla: 'মতামত', nameEnglish: 'Opinion' }
    ];

    try {
      const remoteCats = await apiClient.get<Category[]>('/categories', { signal });
      if (Array.isArray(remoteCats) && remoteCats.length > 0) {
        return remoteCats;
      }
    } catch {
      // Silently fall back to standard local categories on error
    }

    return defaultCategories;
  }
};

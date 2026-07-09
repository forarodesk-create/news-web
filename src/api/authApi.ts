import { apiClient } from '../services/apiClient';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

export const authApi = {
  async getCurrentUser(signal?: AbortSignal): Promise<User | null> {
    try {
      return await apiClient.get<User>('/auth/me', { signal });
    } catch {
      return null;
    }
  },

  async login(credentials: Record<string, string>): Promise<User> {
    return apiClient.post<User>('/auth/login', credentials);
  },

  async logout(): Promise<void> {
    return apiClient.post<void>('/auth/logout');
  }
};

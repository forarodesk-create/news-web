export class ApiError extends Error {
  status: number;
  statusText: string;
  code?: string;

  constructor(message: string, status: number, statusText: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.code = code;
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  timeout?: number;
  signal?: AbortSignal;
}

const DEFAULT_TIMEOUT = 10000; // 10 seconds

export class ApiClient {
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      timeout = DEFAULT_TIMEOUT,
      signal
    } = options;

    // 1. Check Network Offline
    if (typeof window !== 'undefined' && !window.navigator.onLine) {
      throw new ApiError('Network is offline. Please check your internet connection.', 0, 'OFFLINE', 'OFFLINE');
    }

    // 2. Build URL with query params
    const baseUrl = (import.meta as any).env.VITE_API_BASE_URL || (import.meta as any).env.VITE_NEWS_API_URL || '';
    
    // Safety check: if no baseUrl is configured, throw a clear missing configuration error
    if (!baseUrl) {
      throw new ApiError(
        'API Base URL is not configured. Please define VITE_API_BASE_URL or VITE_NEWS_API_URL in your environment or Settings.',
        0,
        'MISSING_CONFIG',
        'MISSING_CONFIG'
      );
    }

    // Construct final URL
    const urlString = endpoint.startsWith('http') 
      ? endpoint 
      : endpoint 
        ? `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`
        : baseUrl;
    const url = new URL(urlString);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Inject VITE_API_KEY if configured
    const apiKey = (import.meta as any).env.VITE_API_KEY || '';
    if (apiKey && !url.searchParams.has('apikey') && !url.searchParams.has('apiKey')) {
      url.searchParams.append('apikey', apiKey);
    }

    // 3. Setup Request Headers
    const requestHeaders: Record<string, string> = {
      'Accept': 'application/json',
      ...headers
    };

    if (body && !(body instanceof FormData)) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    // 4. Implement Timeout & Abort Controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    // Link external signal to our controller
    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: requestHeaders,
        body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      // 5. Handle HTTP status codes: 401, 403, 404, 429, 500, etc.
      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json() as Record<string, unknown>;
          if (errorData && typeof errorData === 'object') {
            if (errorData.message) {
              errorMessage = String(errorData.message);
            } else if (errorData.error) {
              errorMessage = String(errorData.error);
            } else if (errorData.results && typeof errorData.results === 'object') {
              const resultsObj = errorData.results as Record<string, unknown>;
              if (resultsObj.message) {
                errorMessage = String(resultsObj.message);
              }
            } else if (errorData.status === 'error' && errorData.results && typeof errorData.results === 'object') {
              // Some versions nested error messages under results
              const resultsObj = errorData.results as Record<string, unknown>;
              if (resultsObj.message) {
                errorMessage = String(resultsObj.message);
              }
            }
          }
        } catch {
          // Fallback if response is not JSON
        }

        throw new ApiError(errorMessage, response.status, response.statusText);
      }

      // Handle Empty Response
      if (response.status === 204) {
        return {} as T;
      }

      const text = await response.text();
      if (!text) {
        return {} as T;
      }

      try {
        return JSON.parse(text) as T;
      } catch (jsonError) {
        throw new ApiError('Failed to parse API response as JSON', response.status, 'PARSE_ERROR', 'PARSE_ERROR');
      }
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        throw error;
      }

      const err = error as Error;
      if (err.name === 'AbortError') {
        if (controller.signal.aborted && !signal?.aborted) {
          throw new ApiError('API request timed out.', 408, 'TIMEOUT', 'TIMEOUT');
        }
        throw new ApiError('Request was cancelled.', 499, 'CANCELLED', 'CANCELLED');
      }

      // Check window offline
      if (typeof window !== 'undefined' && !window.navigator.onLine) {
        throw new ApiError('Network is offline. Please check your internet connection.', 0, 'OFFLINE', 'OFFLINE');
      }

      throw new ApiError(err.message || 'An unexpected network error occurred.', 0, 'NETWORK_ERROR', 'NETWORK_ERROR');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

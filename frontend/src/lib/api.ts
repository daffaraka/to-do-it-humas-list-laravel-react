import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import type { AxiosResponse } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

const CACHE_PREFIX = 'timepro-api-cache:';
const DEFAULT_CACHE_TTL = 30_000;
const cacheRequests = new Map<string, Promise<AxiosResponse>>();

type CachedResponse<T> = {
  expiresAt: number;
  data: T;
};

const cacheKey = (url: string) => `${CACHE_PREFIX}${url}`;

const readCache = <T,>(url: string): T | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(cacheKey(url));
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedResponse<T>;
    if (cached.expiresAt <= Date.now()) {
      sessionStorage.removeItem(cacheKey(url));
      return null;
    }
    return cached.data;
  } catch {
    return null;
  }
};

const writeCache = <T,>(url: string, data: T, ttl: number) => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(cacheKey(url), JSON.stringify({
      expiresAt: Date.now() + ttl,
      data,
    } satisfies CachedResponse<T>));
  } catch {
    // sessionStorage can be unavailable or full; the network response still works.
  }
};

export const clearApiCache = () => {
  if (typeof window === 'undefined') return;
  Object.keys(sessionStorage)
    .filter((key) => key.startsWith(CACHE_PREFIX))
    .forEach((key) => sessionStorage.removeItem(key));
};

/** Return the last response immediately, while refreshing it in the background. */
export const cachedGet = async <T = unknown>(url: string, ttl = DEFAULT_CACHE_TTL): Promise<AxiosResponse<T>> => {
  // These responses depend on the logged-in user's role/department visibility.
  // Reusing a session cache here can show data from a previous role selection.
  if (/^\/(users|boards|departments|tasks)(\/|\?|$)/.test(url)) {
    return api.get<T>(url);
  }

  const cached = readCache<T>(url);
  if (cached !== null) {
    if (!cacheRequests.has(url)) {
      const refresh = api.get<T>(url)
        .then((response) => {
          writeCache(url, response.data, ttl);
          return response;
        })
        .finally(() => cacheRequests.delete(url));
      cacheRequests.set(url, refresh as Promise<AxiosResponse>);
    }
    return { data: cached } as AxiosResponse<T>;
  }

  if (!cacheRequests.has(url)) {
    const request = api.get<T>(url)
      .then((response) => {
        writeCache(url, response.data, ttl);
        return response;
      })
      .finally(() => cacheRequests.delete(url));
    cacheRequests.set(url, request as Promise<AxiosResponse>);
  }

  return cacheRequests.get(url) as Promise<AxiosResponse<T>>;
};

api.interceptors.request.use((config) => {
  // Skip ngrok browser warning page
  config.headers['ngrok-skip-browser-warning'] = 'true';
  
  if (typeof window !== 'undefined') {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.config.method && response.config.method.toLowerCase() !== 'get') {
      clearApiCache();
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;

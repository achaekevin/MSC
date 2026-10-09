// Centralized API Client Architecture for MSC Frontend
// Connects with Node.js + Express + Prisma + MySQL backend (v1)

const getBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api/v1';
  }
  return 'http://localhost:5000/api/v1';
};

export const BASE_URL = getBaseUrl();

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public errors?: Record<string, string[]> | Array<{ field: string; message: string }>,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('msc_access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Helper function to normalize URL paths
const normalizeUrl = (endpoint: string): string => {
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (cleanEndpoint.startsWith('/api/v1/')) {
    cleanEndpoint = cleanEndpoint.replace('/api/v1', '');
  } else if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.replace('/api', '');
  }
  return `${BASE_URL.replace(/\/$/, '')}${cleanEndpoint}`;
};

// Centralized handler for 401 Unauthorized responses to guarantee expired session behavior
const handleUnauthorized = () => {
  localStorage.removeItem('msc_access_token');
  localStorage.removeItem('msc_user');
  localStorage.removeItem('msc_refresh_token');
  try {
    sessionStorage.clear();
  } catch {}

  // Redirect to login if currently on an admin route
  if (
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/admin') &&
    !window.location.pathname.startsWith('/admin/login')
  ) {
    window.location.href = '/admin/login';
  }
};

const processErrorResponse = (response: Response, errData: any): ApiError => {
  const status = response.status;
  if (status === 401) {
    handleUnauthorized();
  }

  const rawMessage = errData?.error?.message || errData?.message;
  const errors = errData?.errors || errData?.error?.details;
  const code = errData?.error?.code;

  if (rawMessage && typeof rawMessage === 'string' && rawMessage.trim().length > 0) {
    return new ApiError(rawMessage, status, errors, code);
  }

  // Friendly defaults by status code
  let defaultMessage = 'An unexpected error occurred. Please try again.';
  if (status === 400) defaultMessage = 'The request was invalid. Please check your submission.';
  else if (status === 401) defaultMessage = 'Your session has expired. Please sign in again.';
  else if (status === 403) defaultMessage = 'You do not have permission to access this resource.';
  else if (status === 404) defaultMessage = 'The requested information was not found.';
  else if (status === 409) defaultMessage = 'A conflict occurred with an existing entry.';
  else if (status === 422) defaultMessage = 'Please verify that all required fields are filled correctly.';
  else if (status === 429) defaultMessage = 'Too many requests. Please wait a moment and try again.';
  else if (status >= 500) defaultMessage = 'Server is temporarily unavailable. Please try again shortly.';

  return new ApiError(defaultMessage, status, errors, code);
};

const handleNetworkOrCatchError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }
  const rawMsg = error instanceof Error ? error.message : '';
  const isNetwork =
    (typeof navigator !== 'undefined' && !navigator.onLine) ||
    rawMsg.includes('Failed to fetch') ||
    rawMsg.includes('NetworkError') ||
    rawMsg.includes('Load failed');

  const message = isNetwork
    ? 'Unable to connect to the server. Please check your internet connection and try again.'
    : 'A technical error occurred while processing your request. Please try again.';

  return new ApiError(message, undefined, undefined, 'NETWORK_ERROR');
};

export const apiClient = {
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = normalizeUrl(endpoint);
    try {
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          ...getAuthHeaders(),
          ...(options?.headers || {})
        },
        credentials: 'include',
        ...options
      });

      if (!response.ok) {
        let errData;
        try {
          errData = await response.json();
        } catch {
          errData = null;
        }
        throw processErrorResponse(response, errData);
      }

      const data = await response.json();
      return data.success ? data.data : data;
    } catch (error) {
      throw handleNetworkOrCatchError(error);
    }
  },

  async getWithMeta<T>(endpoint: string, options?: RequestInit): Promise<{ data: T; pagination?: any }> {
    const url = normalizeUrl(endpoint);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...getAuthHeaders(),
          ...(options?.headers || {})
        },
        credentials: 'include',
        ...options
      });

      if (!response.ok) {
        let errData;
        try {
          errData = await response.json();
        } catch {
          errData = null;
        }
        throw processErrorResponse(response, errData);
      }

      const json = await response.json();
      return {
        data: json.data !== undefined ? json.data : json,
        pagination: json.pagination
      };
    } catch (error) {
      throw handleNetworkOrCatchError(error);
    }
  },

  async post<T>(endpoint: string, data: unknown, options?: RequestInit): Promise<T> {
    const url = normalizeUrl(endpoint);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...getAuthHeaders(),
          ...(options?.headers || {})
        },
        credentials: 'include',
        body: JSON.stringify(data),
        ...options
      });

      if (!response.ok) {
        let errData;
        try {
          errData = await response.json();
        } catch {
          errData = null;
        }
        throw processErrorResponse(response, errData);
      }

      const responseData = await response.json();
      return responseData.success ? responseData.data : responseData;
    } catch (error) {
      throw handleNetworkOrCatchError(error);
    }
  },

  async put<T>(endpoint: string, data: unknown, options?: RequestInit): Promise<T> {
    const url = normalizeUrl(endpoint);
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...getAuthHeaders(),
          ...(options?.headers || {})
        },
        credentials: 'include',
        body: JSON.stringify(data),
        ...options
      });

      if (!response.ok) {
        let errData;
        try {
          errData = await response.json();
        } catch {
          errData = null;
        }
        throw processErrorResponse(response, errData);
      }

      const responseData = await response.json();
      return responseData.success ? responseData.data : responseData;
    } catch (error) {
      throw handleNetworkOrCatchError(error);
    }
  },

  async patch<T>(endpoint: string, data: unknown, options?: RequestInit): Promise<T> {
    const url = normalizeUrl(endpoint);
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...getAuthHeaders(),
          ...(options?.headers || {})
        },
        credentials: 'include',
        body: JSON.stringify(data),
        ...options
      });

      if (!response.ok) {
        let errData;
        try {
          errData = await response.json();
        } catch {
          errData = null;
        }
        throw processErrorResponse(response, errData);
      }

      const responseData = await response.json();
      return responseData.success ? responseData.data : responseData;
    } catch (error) {
      throw handleNetworkOrCatchError(error);
    }
  },

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = normalizeUrl(endpoint);
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...getAuthHeaders(),
          ...(options?.headers || {})
        },
        credentials: 'include',
        ...options
      });

      if (!response.ok) {
        let errData;
        try {
          errData = await response.json();
        } catch {
          errData = null;
        }
        throw processErrorResponse(response, errData);
      }

      const responseData = await response.json();
      return responseData.success ? responseData.data : responseData;
    } catch (error) {
      throw handleNetworkOrCatchError(error);
    }
  }
};

export const api = apiClient;

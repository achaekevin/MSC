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

const BASE_URL = getBaseUrl();

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public errors?: Record<string, string[]> | Array<{ field: string; message: string }>
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

export const apiClient = {
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
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
        credentials: 'include', // Include cookies for refresh token
        ...options
      });

      if (!response.ok) {
        let errData;
        try {
          errData = await response.json();
        } catch {
          errData = { message: `Request failed with status ${response.status}` };
        }

        // Handle authentication errors
        if (response.status === 401) {
          // Token expired or invalid - clear local state
          localStorage.removeItem('msc_access_token');
          localStorage.removeItem('msc_user');
          
          // Redirect to login if on admin route
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin/login';
          }
        }

        throw new ApiError(errData.message || 'API request failed', response.status, errData.errors);
      }

      const data = await response.json();
      return data.success ? data.data : data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error or backend server unreachable'
      );
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
          errData = { message: `Request failed with status ${response.status}` };
        }

        if (response.status === 401) {
          localStorage.removeItem('msc_access_token');
          localStorage.removeItem('msc_user');
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin/login';
          }
        }

        throw new ApiError(errData.message || 'API request failed', response.status, errData.errors);
      }

      const json = await response.json();
      return {
        data: json.data !== undefined ? json.data : json,
        pagination: json.pagination
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error or backend server unreachable'
      );
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
        credentials: 'include', // Include cookies for refresh token
        body: JSON.stringify(data),
        ...options
      });

      if (!response.ok) {
        let errData;
        try {
          errData = await response.json();
        } catch {
          errData = { message: `Submission failed with status ${response.status}` };
        }

        // Handle authentication errors
        if (response.status === 401) {
          localStorage.removeItem('msc_access_token');
          localStorage.removeItem('msc_user');
          
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin/login';
          }
        }

        throw new ApiError(errData.message || 'Form submission failed', response.status, errData.errors);
      }

      const responseData = await response.json();
      return responseData.success ? responseData.data : responseData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error or backend server unreachable'
      );
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
          errData = { message: `Update failed with status ${response.status}` };
        }

        if (response.status === 401) {
          localStorage.removeItem('msc_access_token');
          localStorage.removeItem('msc_user');
          
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin/login';
          }
        }

        throw new ApiError(errData.message || 'Update failed', response.status, errData.errors);
      }

      const responseData = await response.json();
      return responseData.success ? responseData.data : responseData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error or backend server unreachable'
      );
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
          errData = { message: `Update failed with status ${response.status}` };
        }

        if (response.status === 401) {
          localStorage.removeItem('msc_access_token');
          localStorage.removeItem('msc_user');
          
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin/login';
          }
        }

        throw new ApiError(errData.message || 'Patch failed', response.status, errData.errors);
      }

      const responseData = await response.json();
      return responseData.success ? responseData.data : responseData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error or backend server unreachable'
      );
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
          errData = { message: `Delete failed with status ${response.status}` };
        }

        if (response.status === 401) {
          localStorage.removeItem('msc_access_token');
          localStorage.removeItem('msc_user');
          
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin/login';
          }
        }

        throw new ApiError(errData.message || 'Delete failed', response.status, errData.errors);
      }

      const responseData = await response.json();
      return responseData.success ? responseData.data : responseData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error or backend server unreachable'
      );
    }
  }
};

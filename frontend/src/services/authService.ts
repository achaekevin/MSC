// Authentication Service for MSC Frontend
// Handles JWT tokens, user sessions, and backend communication

const getBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api/v1';
  }
  return 'http://localhost:5000/api/v1';
};

const BASE_URL = getBaseUrl();

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
}

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'CONTENT_ADMIN' 
  | 'EDITOR'
  | 'REVIEWER'
  | 'FORM_MANAGER';

export type Permission =
  | 'CONTENT_CREATE'
  | 'CONTENT_READ'
  | 'CONTENT_UPDATE'
  | 'CONTENT_DELETE'
  | 'CONTENT_REVIEW'
  | 'CONTENT_APPROVE'
  | 'CONTENT_PUBLISH'
  | 'MEDIA_MANAGE'
  | 'FORM_READ'
  | 'FORM_UPDATE'
  | 'USER_MANAGE'
  | 'AUDIT_READ'
  | 'SETTINGS_MANAGE';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  adminInviteCode: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

class AuthService {
  private accessToken: string | null = null;
  private user: User | null = null;
  
  constructor() {
    // Initialize from localStorage on service creation
    this.accessToken = localStorage.getItem('msc_access_token');
    const storedUser = localStorage.getItem('msc_user');
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
      } catch {
        localStorage.removeItem('msc_user');
      }
    }
  }

  private async makeAuthRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}/auth${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string>)
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include' // Include cookies for refresh token
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `Request failed with status ${response.status}` };
        }

        if (response.status === 401) {
          // Token expired or invalid - clear local state
          this.clearAuthState();
        }

        throw new AuthError(
          errorData.error?.message || errorData.message || 'Authentication failed',
          response.status,
          errorData.error?.code
        );
      }

      const data = await response.json();
      return data.success ? data.data : data;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(
        error instanceof Error ? error.message : 'Network error'
      );
    }
  }

  private setAuthState(user: User, accessToken: string, refreshToken?: string) {
    this.user = user;
    this.accessToken = accessToken;
    localStorage.setItem('msc_user', JSON.stringify(user));
    localStorage.setItem('msc_access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('msc_refresh_token', refreshToken);
    }
  }

  clearAuthState() {
    this.user = null;
    this.accessToken = null;
    localStorage.removeItem('msc_user');
    localStorage.removeItem('msc_access_token');
    localStorage.removeItem('msc_refresh_token');
    localStorage.removeItem('token');
    try {
      sessionStorage.clear();
    } catch {
      // Ignore if sessionStorage not accessible
    }
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.makeAuthRequest<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    this.setAuthState(response.user, response.accessToken, response.refreshToken);
    return response;
  }

  async register(credentials: RegisterCredentials): Promise<LoginResponse> {
    const response = await this.makeAuthRequest<LoginResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    this.setAuthState(response.user, response.accessToken, response.refreshToken);
    return response;
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('msc_refresh_token');
    try {
      await this.makeAuthRequest('/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken })
      });
    } catch (err) {
      console.warn('Server logout request failed:', err);
    } finally {
      this.clearAuthState();
    }
  }

  async refreshToken(): Promise<LoginResponse> {
    const response = await this.makeAuthRequest<LoginResponse>('/refresh', {
      method: 'POST',
      body: JSON.stringify({
        refreshToken: localStorage.getItem('msc_refresh_token')
      })
    });

    this.setAuthState(response.user, response.accessToken, response.refreshToken);
    return response;
  }

  async getCurrentUser(): Promise<User> {
    if (!this.accessToken) {
      throw new AuthError('No access token available');
    }

    const response = await this.makeAuthRequest<User>('/me');
    this.user = response;
    localStorage.setItem('msc_user', JSON.stringify(response));
    return response;
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<{ message: string }> {
    return this.makeAuthRequest('/forgot-password', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async resetPassword(request: ResetPasswordRequest): Promise<{ message: string }> {
    return this.makeAuthRequest('/reset-password', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async changePassword(request: ChangePasswordRequest): Promise<{ message: string }> {
    return this.makeAuthRequest('/change-password', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.user;
  }

  getUser(): User | null {
    return this.user;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  hasRole(role: UserRole): boolean {
    return this.user?.role === role;
  }

  hasPermission(permission: Permission): boolean {
    return this.user?.permissions.includes(permission) ?? false;
  }

  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  // Role hierarchy checks
  isSuperAdmin(): boolean {
    return this.hasRole('SUPER_ADMIN');
  }

  isContentAdmin(): boolean {
    return this.hasRole('CONTENT_ADMIN') || this.isSuperAdmin();
  }

  isEditor(): boolean {
    return this.hasRole('EDITOR') || this.isContentAdmin();
  }

  isReviewer(): boolean {
    return this.hasRole('REVIEWER') || this.isContentAdmin();
  }

  isFormManager(): boolean {
    return this.hasRole('FORM_MANAGER') || this.isContentAdmin();
  }

  canCreateContent(): boolean {
    return this.hasPermission('CONTENT_CREATE');
  }

  canEditContent(): boolean {
    return this.hasPermission('CONTENT_UPDATE');
  }

  canDeleteContent(): boolean {
    return this.hasPermission('CONTENT_DELETE');
  }

  canReviewContent(): boolean {
    return this.hasPermission('CONTENT_REVIEW');
  }

  canApproveContent(): boolean {
    return this.hasPermission('CONTENT_APPROVE');
  }

  canPublishContent(): boolean {
    return this.hasPermission('CONTENT_PUBLISH');
  }

  canManageMedia(): boolean {
    return this.hasPermission('MEDIA_MANAGE');
  }

  canManageForms(): boolean {
    return this.hasPermission('FORM_UPDATE');
  }

  canManageUsers(): boolean {
    return this.hasPermission('USER_MANAGE');
  }

  canViewAuditLogs(): boolean {
    return this.hasPermission('AUDIT_READ');
  }

  canManageSettings(): boolean {
    return this.hasPermission('SETTINGS_MANAGE');
  }
}

export const authService = new AuthService();
export default authService;
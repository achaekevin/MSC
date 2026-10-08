import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, User, LoginCredentials, RegisterCredentials, ChangePasswordRequest, AuthError, LoginResult, LoginResponse } from '../services/authService';

interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  verifyTwoFactor: (tempToken: string, code: string) => Promise<LoginResponse>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  clearError: () => void;

  // Utility methods
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize auth state from localStorage and verify with backend
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (authService.isAuthenticated()) {
        // Try to get current user from backend to verify token
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } else {
        // Only attempt refresh if user previously had an active session
        // If user explicitly logged out, msc_refresh_token is removed and no auto-login happens
        const hasStoredRefreshToken = !!localStorage.getItem('msc_refresh_token');
        if (hasStoredRefreshToken) {
          try {
            const response = await authService.refreshToken();
            setUser(response.user);
          } catch {
            authService.clearAuthState();
            setUser(null);
          }
        } else {
          authService.clearAuthState();
          setUser(null);
        }
      }
    } catch (error) {
      console.warn('Auth initialization failed:', error);
      authService.clearAuthState();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    setError(null);

    try {
      const response = await authService.login(credentials);
      if ('requires2FA' in response) {
        return response;
      }
      setUser(response.user);
      return response;
    } catch (error) {
      if (error instanceof AuthError) {
        setError(error.message);
      } else {
        setError('Login failed. Please try again.');
      }
      throw error;
    }
  };

  const verifyTwoFactor = async (tempToken: string, code: string): Promise<LoginResponse> => {
    setError(null);

    try {
      const response = await authService.verifyTwoFactor(tempToken, code);
      setUser(response.user);
      return response;
    } catch (error) {
      if (error instanceof AuthError) {
        setError(error.message);
      } else {
        setError('Verification failed. Please check the code and try again.');
      }
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setError(null);

    try {
      const response = await authService.register(credentials);
      setUser(response.user);
    } catch (error) {
      if (error instanceof AuthError) {
        setError(error.message);
      } else {
        setError('Registration failed. Please try again.');
      }
      throw error;
    }
  };

  const changePassword = async (data: ChangePasswordRequest) => {
    setError(null);

    try {
      await authService.changePassword(data);
    } catch (error) {
      if (error instanceof AuthError) {
        setError(error.message);
      } else {
        setError('Failed to change password. Please check your current password.');
      }
      throw error;
    }
  };

  const logout = async () => {
    setError(null);

    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      setUser(null);
      authService.clearAuthState();
      try {
        sessionStorage.clear();
      } catch {}
    }
  };

  const refreshToken = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.refreshToken();
      setUser(response.user);
    } catch (error) {
      if (error instanceof AuthError) {
        setError(error.message);
      }
      // If refresh fails, user should be logged out
      setUser(null);
      authService.logout();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const hasRole = (role: string): boolean => {
    return authService.hasRole(role as any);
  };

  const hasPermission = (permission: string): boolean => {
    return authService.hasPermission(permission as any);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return authService.hasAnyPermission(permissions as any);
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return authService.hasAllPermissions(permissions as any);
  };

  const value: AuthContextType = {
    // State
    user,
    isAuthenticated: !!user,
    isLoading,
    error,

    // Actions
    login,
    verifyTwoFactor,
    register,
    logout,
    refreshToken,
    changePassword,
    clearError,

    // Utilities
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Utility hooks for common checks
export const useRequireAuth = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login page
      window.location.href = '/admin/login';
    }
  }, [isAuthenticated, isLoading]);

  return { isAuthenticated, user, isLoading };
};

export const useRequirePermission = (permission: string) => {
  const { hasPermission, user, isLoading } = useAuth();
  const hasRequiredPermission = hasPermission(permission);

  useEffect(() => {
    if (!isLoading && !hasRequiredPermission) {
      console.warn(`Access denied: Missing permission '${permission}'`);
      // Could redirect to unauthorized page
    }
  }, [hasRequiredPermission, isLoading, permission]);

  return { hasPermission: hasRequiredPermission, user, isLoading };
};

export const useRequireRole = (role: string) => {
  const { hasRole, user, isLoading } = useAuth();
  const hasRequiredRole = hasRole(role);

  useEffect(() => {
    if (!isLoading && !hasRequiredRole) {
      console.warn(`Access denied: Missing role '${role}'`);
    }
  }, [hasRequiredRole, isLoading, role]);

  return { hasRole: hasRequiredRole, user, isLoading };
};

export default AuthContext;
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, User, LoginCredentials, AuthError } from '../services/authService';

interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
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
        // Try to refresh token in case access token expired
        try {
          const response = await authService.refreshToken();
          setUser(response.user);
        } catch {
          // Refresh failed - user needs to log in
          authService.logout(); // Clear any stale local state
        }
      }
    } catch (error) {
      console.warn('Auth initialization failed:', error);
      authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      setUser(response.user);
    } catch (error) {
      if (error instanceof AuthError) {
        setError(error.message);
      } else {
        setError('Login failed. Please try again.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.warn('Logout failed:', error);
      // Clear local state even if logout API call fails
      setUser(null);
    } finally {
      setIsLoading(false);
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
    logout,
    refreshToken,
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
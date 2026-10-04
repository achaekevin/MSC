import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoader } from '../ui/Skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  requiredPermissions?: string[];
  requireAll?: boolean; // If true, user must have ALL permissions. If false, ANY permission is sufficient.
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  requiredPermissions = [],
  requireAll = false
}) => {
  const { user, isAuthenticated, isLoading, hasPermission, hasRole, hasAllPermissions, hasAnyPermission } = useAuth();
  const location = useLocation();

  // Show loading while auth state is being determined
  if (isLoading) {
    return <PageLoader />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  // Check single permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  // Check multiple permissions requirement
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasRequiredPermissions) {
      return <Navigate to="/admin/unauthorized" replace />;
    }
  }

  // All checks passed - render children
  return <>{children}</>;
};

interface PublicOnlyRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({
  children,
  redirectTo = '/admin/dashboard'
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  // Redirect authenticated users away from public-only routes (like login page)
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

// Utility component for conditional rendering based on permissions
interface ConditionalRenderProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  role?: string;
  requireAll?: boolean;
  fallback?: ReactNode;
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  children,
  permission,
  permissions = [],
  role,
  requireAll = false,
  fallback = null
}) => {
  const { hasPermission, hasRole, hasAllPermissions, hasAnyPermission } = useAuth();

  // Check role requirement
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  // Check single permission requirement
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions requirement
  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasRequiredPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
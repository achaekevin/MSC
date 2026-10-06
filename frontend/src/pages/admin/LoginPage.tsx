import React, { useState } from 'react';
import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, user, isAuthenticated, isLoading, error, clearError } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  // Redirect if already authenticated
  if (isAuthenticated) {
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'CONTENT_ADMIN';
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
    return <Navigate to={from} replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear any existing errors when user starts typing
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await login({
        email: formData.email.trim(),
        password: formData.password
      });

      // Retrieve user from storage to check role immediately
      const stored = localStorage.getItem('msc_user');
      let authedUser = user;
      if (stored) {
        try {
          authedUser = JSON.parse(stored);
        } catch {}
      }

      const isAdmin = authedUser?.role === 'SUPER_ADMIN' || authedUser?.role === 'CONTENT_ADMIN';
      if (isAdmin) {
        navigate(from, { replace: true });
      } else {
        // Non-admin accounts cannot access the admin dashboard
        navigate('/admin/unauthorized', { replace: true });
      }
    } catch (err) {
      console.error('Login failed:', err);
      // Error is handled by the AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <Link to="/" className="flex justify-center">
            <img
              className="h-16 w-auto"
              src="/images/logo.png"
              alt="Mwancha Senior Community"
            />
          </Link>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Administration Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage MSC content and operations
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3.5 py-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600 sm:text-sm transition-colors"
                placeholder="admin@mwanchasenior.com"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3.5 py-2.5 pr-11 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600 sm:text-sm transition-colors"
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-charcoal-600 hover:text-forest-800 focus:outline-none z-20 cursor-pointer transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-charcoal-700 hover:text-forest-800 transition-colors" aria-hidden="true" />
                  ) : (
                    <Eye className="w-5 h-5 text-charcoal-700 hover:text-forest-800 transition-colors" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-forest-800 hover:bg-forest-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest-600 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="text-center">
            <Link
              to="/admin/forgot-password"
              className="text-sm text-forest-700 hover:text-forest-900 font-medium"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Restricted Access Advisory */}
          <div className="pt-3 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              Administrative access is restricted to verified MSC personnel. Account provisioning and roles are authorized and configured by the MSC Systems Administrator.
            </p>
          </div>
        </form>

        {/* Return to Website Link */}
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Return to website
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
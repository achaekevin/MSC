import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">
            You don't have the required permissions to access this page.
          </p>
        </div>

        {/* User Info */}
        {user && (
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Signed in as:</span> {user.name} ({user.email})
            </p>
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-medium">Role:</span> {user.role.replace('_', ' ')}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            If you believe you should have access to this page, please contact your administrator.
          </p>
          
          <div className="space-y-2">
            <Link
              to="/admin/dashboard"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </Link>
            
            <button
              onClick={handleLogout}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign Out
            </button>
            
            <Link
              to="/"
              className="w-full flex justify-center py-2 px-4 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Return to Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
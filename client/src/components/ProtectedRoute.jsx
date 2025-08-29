// client/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * A component that protects routes by checking authentication status
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string} [props.redirectPath] - Path to redirect to if not authenticated (defaults to '/login')
 * @param {string} [props.redirectMessage] - Message to show on the login page
 * @returns {JSX.Element} - Protected route or redirect
 */
const ProtectedRoute = ({ 
  children, 
  redirectPath = '/login',
  redirectMessage = 'Please log in to access this page.'
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectPath} 
        state={{ 
          from: location.pathname,
          message: redirectMessage
        }} 
        replace 
      />
    );
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
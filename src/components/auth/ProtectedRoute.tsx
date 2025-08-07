import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingScreen } from '../ui/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback
}) => {
  const { isAuthenticated, isLoading, error } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  // Show fallback or loading screen if not authenticated
  if (!isAuthenticated) {
    return fallback || <LoadingScreen message="Please log in to continue..." />;
  }

  // Show children if authenticated
  return <>{children}</>;
};

export const AuthGuard: React.FC<ProtectedRouteProps> = ({
  children,
  fallback
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  // Show children if not authenticated (for auth screens)
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Show fallback if authenticated (redirect to main app)
  return fallback || <LoadingScreen message="Redirecting..." />;
}; 
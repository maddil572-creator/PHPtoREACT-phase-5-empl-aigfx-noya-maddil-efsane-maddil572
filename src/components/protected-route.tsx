import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { Role } from '@/user/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CircleAlert as AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRoles?: Role[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRoles = [],
  redirectTo = '/user/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasAnyRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to access this page. Your current role is "{user?.role}".
            {requiredRoles.length === 1 ? (
              <> This page requires "{requiredRoles[0]}" access.</>
            ) : (
              <>
                {' '}
                This page requires one of the following roles:{' '}
                {requiredRoles.map((role, idx) => (
                  <span key={role}>
                    "{role}"
                    {idx < requiredRoles.length - 1 ? ', ' : ''}
                  </span>
                ))}
                .
              </>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, session, sessionInfo, loading, mfaRequired } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No session at all → login
  if (!session || !user) {
    return <Navigate to="/auth" replace />;
  }

  // MFA enabled but not verified → MFA page
  if (mfaRequired) {
    return <Navigate to="/auth/mfa" replace />;
  }

  // Session validated but not allowlisted → access denied
  if (sessionInfo && !sessionInfo.isAllowlisted) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
}

import { useAuth } from '@/context/AuthContext';

/**
 * Custom hook for authentication
 * Provides easy access to auth state and actions
 */
export function useUser() {
  const { user, isAuthenticated, loading } = useAuth();

  return {
    // User data
    user,
    userId: user?.id,
    userEmail: user?.email,
    userName: user?.name,
    userRoles: user?.roles,
    
    // Booleans
    isAuthenticated,
    // isAdmin,
    // isUser,
    loading,
  };
}

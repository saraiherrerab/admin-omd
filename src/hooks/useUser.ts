import { useAuth } from '@/context/AuthContext';

/**
 * Custom hook for authentication
 * Provides easy access to auth state and actions
 */
export function useUser() {
  const { user, isAuthenticated, loading } = useAuth();

  const isAdmin = user?.role === 'admin' || user?.role === 'Admin';
  const isUser = user?.role === 'user' || user?.role === 'User';
  
  return {
    // User data
    user,
    userId: user?.id,
    userEmail: user?.email,
    userName: user?.name,
    userRole: user?.role,
    
    // Booleans
    isAuthenticated,
    isAdmin,
    isUser,
    loading,
  };
}

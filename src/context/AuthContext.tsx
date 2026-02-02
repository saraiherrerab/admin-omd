import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import authService from '@/services/authService';
import type { User, JWTPayload, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state from stored token
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        try {
          // Decode the token to get user data
          const decoded = jwtDecode<JWTPayload>(storedToken);

          // Check if token is expired
          if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            throw new Error('Token expired');
          }

          // Set user data from decoded token
          setUser({
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role,
            username: decoded.username || decoded.email, // Fallback if username missing in token
          });
          setToken(storedToken);

        } catch (error) {
          console.error('Invalid or expired token, attempting refresh:', error);
          localStorage.removeItem('token');
          setToken(null);
          // Try to verify session via cookie even if local token failed
          await checkSession();
        }
      } else {
        // No local token, check if we have a valid session cookie
        await checkSession();
      }

      setLoading(false);
    };

    const checkSession = async () => {
      try {
        const response = await authService.verifyToken();

        if (response.token) {
          localStorage.setItem('token', response.token);
          setToken(response.token);
        }

        if (response.user) {
          setUser({
            id: Number(response.user.id),
            email: response.user.email,
            username: response.user.email, // Fallback
            name: response.user.name || '',
            role: response.user.role || 'user',
          });
        }
      } catch (error) {
        // Silent fail, user is just not logged in
        setUser(null);
      }
    };

    initAuth();
  }, []);

  /**
   * Login user with email/username and password
   */
  const login = async (email: string, password: string) => {
    try {
      // Call the login API (note: your API uses "username" field)
      const response = await authService.login(email, password);

      // The API might return a token in the response or set it as a cookie
      // If it returns a token, store it
      if (response.token) {
        localStorage.setItem('token', response.token);
        setToken(response.token);

        // Decode token to get user info
        const decoded = jwtDecode<JWTPayload>(response.token);
        setUser({
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
          username: decoded.username,
        });
      } else if (response.user) {
        // If API returns user data directly (cookie-based auth)
        setUser({
          id: Number(response.user.id),
          email: response.user.email,
          username: response.user.email, // Fallback
          name: response.user.name || '',
          role: response.user.role || 'user',
        });
      }

    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  /**
   * Register new user
   */
  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await authService.register({
        username: email, // Your API uses "username"
        password,
        name,
        email,
      });

      // After successful registration, log the user in
      if (response.token) {
        localStorage.setItem('token', response.token);
        setToken(response.token);

        const decoded = jwtDecode<JWTPayload>(response.token);
        setUser({
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
          username: decoded.username,
        });
      } else if (response.user) {
        setUser({
          id: Number(response.user.id),
          email: response.user.email,
          username: response.user.email, // Fallback
          name: response.user.name || '',
          role: response.user.role || 'user',
        });
      }

    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      // Call backend logout to clear the JWT cookie
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state regardless of API call success
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  /**
   * Refresh user data from the server
   */
  const refreshUser = async () => {
    try {
      const response = await authService.verifyToken();
      if (response.user) {
        setUser({
          id: Number(response.user.id),
          email: response.user.email,
          username: response.user.email, // Fallback
          name: response.user.name || '',
          role: response.user.role || 'user',
        });
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If verification fails, logout the user
      await logout();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      refreshUser,
      isAuthenticated: !!user,
      loading
    }}>
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

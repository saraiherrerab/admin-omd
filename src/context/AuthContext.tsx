import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import authService from '@/services/authService';
import type { User, JWTPayload, AuthContextType } from '@/types/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // const toast = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        try {
          const decoded = jwtDecode<JWTPayload>(storedToken);
          const isExpired = decoded.exp && decoded.exp * 1000 < Date.now();

          if (!isExpired) {
            setUser({
              id: decoded.id,
              email: decoded.email,
              name: decoded.name,
              roles: decoded.roles || [],
              // username: decoded.username || decoded.email,
            });
            setToken(storedToken);
          } else {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        } catch (e) {
          console.error("Token corrupto");
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
      }
      setLoading(false);
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
      //  console.log(response)
      // The API might return a token in the response or set it as a cookie
      // If it returns a token, store it
      if (response.token) {
        localStorage.setItem('token', response.token);
        setToken(response.token);

        // Decode token to get user info
        const decoded = jwtDecode<JWTPayload>(response.token);
        // console.log(decoded)
        setUser({
          id: decoded.id,
          email: response?.user?.email!,
          name: response?.user?.name!,
          roles: response?.user?.roles || [],
          // username: response?.user?.username!,
        });

      } else if (response.user) {
        // If API returns user data directly (cookie-based auth)
        setUser({
          id: Number(response.user.id),
          email: response.user.email,
          // username: response.user.email, // Fallback
          name: response.user.name || '',
          roles: response.user.roles || []
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
        // username: email,
        password,
        name,
        email,
      });

      // After successful registration, send to login
      if (response.token) {
        navigate('/login');
        toast.success('Registration successful');
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




  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
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

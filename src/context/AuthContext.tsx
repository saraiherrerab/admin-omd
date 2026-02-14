import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import authService from '@/services/authService';
import type { User, JWTPayload, AuthContextType } from '@/types/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { Permission } from '@/types/permissions';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialize user from localStorage to prevent flash of empty state
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // const toast = useToast();

  // Helper to update user and persist to localStorage
  const updateUser = (userData: User | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken) {
        try {
          const decoded = jwtDecode<JWTPayload>(storedToken);
          const isExpired = decoded.exp && decoded.exp * 1000 < Date.now();

          if (!isExpired) {
            // If we have stored user data, validate and use it
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);
              // Validate that all required fields exist
              if (parsedUser.id && parsedUser.email && parsedUser.name) {
                setUser(parsedUser);
                setToken(storedToken);
              } else {
                // Incomplete user data - clear and require re-login
                //     console.log('Incomplete user data, clearing session');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
              }
            } else {
              // No stored user data - require re-login to get full user info
              //   console.log('No stored user data, clearing session');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
            }
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        } catch (e) {
          console.error("Token corrupto");
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
        localStorage.removeItem('user');
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
        //  console.log(response);
        // Decode token to get user info
        const decoded = jwtDecode<JWTPayload>(response.token);
        // Persist user data to localStorage
        updateUser({
          id: decoded.id,
          email: response?.user?.email!,
          name: response?.user?.name!,
          roles: response?.user?.roles || [],
          permissions: response?.user?.permissions!,
        });

      } else if (response.user) {
        // If API returns user data directly (cookie-based auth)
        updateUser({
          id: Number(response.user.id),
          email: response.user.email,
          name: response.user.name || '',
          roles: response.user.roles || [],
          permissions: response.user.permissions!,
        });
      }

    } catch (error: any) {
      // console.error('Login error:', error);
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
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  const updatePermissionsLocally = (roleId: number, newPermissions: Permission[]) => {
    if (!user) return;

    const updatedRoles = user.roles.map(role =>
      role.id === roleId ? { ...role, permissions: newPermissions } : role
    );
    //console.log(updatedRoles);
    window.location.reload();

    const updatedUser = { ...user, roles: updatedRoles };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };


  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      updatePermissionsLocally,
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

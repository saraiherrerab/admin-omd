import type { Role } from '@/types/roles';
import api from './api';

export interface LoginRequest {
  username: string; // Note: Your API uses "username" not "email"
  password: string;
}

export interface LoginResponse {
  token?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    roles?: Pick<Role, 'id'>[];
  };
  message?: string;
}

export interface RegisterRequest {
  // username: string;
  password: string;
  name?: string;
  email?: string;
}

export interface RegisterResponse {
  token?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
  message?: string;
}

/**
 * Authentication Service
 * Handles all auth-related API calls
 */
class AuthService {
  /**
   * Login user
   * @param username - User's email/username
   * @param password - User's password
   * @returns Login response with token and user data
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', {
      username,
      password,
    });
    return response.data;
  }

  /**
   * Register new user
   * @param data - Registration data
   * @returns Registration response with token and user data
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register', data);
    return response.data;
  }

  /**
   * Logout user
   * Calls the backend logout endpoint to clear the JWT cookie
   */
  async logout(): Promise<void> {
    try {
      await api.delete('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, we should still clear local data
    }
  }




}

export default new AuthService();

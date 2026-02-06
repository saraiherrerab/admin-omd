/**
 * User type definitions
 */

import type { Role } from "./roles";

export interface User {
  id: number;
  email: string;
  // username: string;
  name: string;
  password?: string;
  roles: Pick<Role, 'id'>[];
}

export interface JWTPayload extends User {
  iat?: number; // Issued at
  exp?: number; // Expiration time
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}


export interface LoginRequest {
  email: string;
  password: string;
}

import { useState, useCallback } from 'react';
import api from '../services/api'; 
import { toast } from 'react-toastify';
import type { User, UserFilters } from '@/types/users';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{ 
    total: number; 
    totalPages: number; 
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);

  const getUsers = useCallback(async (filters: UserFilters) => {
    setLoading(true);
    
    setUsers([]); // Clear current users while loading new ones
    setError(null);
    try {
      // Remove empty strings, null, and undefined values from params
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      );

      const response = await api.get('/users/search', { params });
      if (response.data.success) {
        setUsers(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError(response.data.message || 'Failed to fetch users');
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || err.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  }, []);

  const getUser = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/users/${id}?includeRoles=true`);
      if (response.data.success) {
        setUser(response.data.data);
      }
      return null;
    } catch (err: any) {
      console.error(`Error fetching user ${id}:`, err);
      setError(err.response?.data?.message || err.message || 'Error fetching user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignRole = useCallback(async (userId: number, roleIds: number[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/users/${userId}/roles`, { roles:roleIds });
      if (response.data.success) {
        toast.success(response.data.message || 'Role assigned successfully');
      }
      return null;
    } catch (err: any) {
      console.error(`Error assigning role to user ${userId}:`, err);
      setError(err.response?.data?.message || err.message || 'Error assigning role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    user,
    loading,
    error,
    pagination,
    getUsers,
    getUser,
    assignRole,
  };
};
import { useState, useCallback } from 'react';
import api from '../services/api';
import type  { Role, CreateRoleDTO, UpdateRoleDTO } from '../types/roles';
import { toast } from 'react-toastify';
import type { User, UserFilters } from '@/types/users';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{ total: number; pages: number } | null>(null);

  const getUsers = useCallback(async (filters: UserFilters) => {
    setLoading(true);
    setUsers([]); // Clear current users while loading new ones
    setError(null);
    try {
      const response = await api.get('/users/search', { params: filters });
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
      const response = await api.get(`/users/${id}?includePermissions=true`);
      if (response.data.success) {
        return response.data.data;
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


  return {
    users,
    loading,
    error,
    pagination,
    getUsers,
    getUser,
  };
};
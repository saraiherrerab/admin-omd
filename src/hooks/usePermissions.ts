import { useState, useCallback } from 'react';
import api from '../services/api';
import type  { Permission } from '../types/permissions';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  const getPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/permissions`);
      if (response.data.success) {
        setPermissions(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch permissions');
      }
    } catch (err: any) {
      console.error('Error fetching permissions:', err);
      setError(err.response?.data?.message || err.message || 'Error fetching permissions');
    } finally {
      setLoading(false);
    }
  }, []);

  const getPermission = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/permissions/${id}`);
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (err: any) {
      console.error(`Error fetching role ${id}:`, err);
      setError(err.response?.data?.message || err.message || 'Error fetching role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);


  return {
    permissions,
    loading,
    error,
    getPermissions,
    getPermission,
  };
};
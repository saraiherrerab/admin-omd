import { useState, useCallback } from 'react';
import api from '../services/api';
import type  { Role, CreateRoleDTO, UpdateRoleDTO } from '../types/roles';
import { toast } from 'react-toastify';

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  const getRoles = useCallback(async (includePermissions = true) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/roles?includePermissions=${includePermissions}`);
      if (response.data.success) {
        setRoles(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch roles');
      }
    } catch (err: any) {
      console.error('Error fetching roles:', err);
      setError(err.response?.data?.message || err.message || 'Error fetching roles');
    } finally {
      setLoading(false);
    }
  }, []);

  const getRole = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/roles/${id}?includePermissions=true`);
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

  const createRole = useCallback(async (roleData: CreateRoleDTO) => {
    setLoading(true);
    setError(null);
    try {
      console.log(roleData);
      const response = await api.post('/roles', roleData);
      if (response.data.success) {
        await getRoles(); // Refresh the list
        return response.data.data;
      } else {
        toast(response.data.message || 'Failed to create role', {
            type: 'error',
           })
           setError(response.data.message || 'Failed to create role');
         throw new Error(response.data.message || 'Failed to create role');
         
      }
    } catch (err: any) {
      console.error('Error creating role:', err);
      setError(err.response?.data?.message || err.message || 'Error creating role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getRoles]);

  const updateRole = useCallback(async (id: number, roleData: UpdateRoleDTO) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/roles/${id}`, roleData);
      if (response.data.success) {
        await getRoles(); // Refresh the list
        return response.data.data;
      } else {
         throw new Error(response.data.message || 'Failed to update role');
      }
    } catch (err: any) {
      console.error('Error updating role:', err);
      setError(err.response?.data?.message || err.message || 'Error updating role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getRoles]);

  const deleteRole = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/roles/${id}`);
       if (response.data.success) {
        await getRoles(); // Refresh the list
        return true;
      } else {
         throw new Error(response.data.message || 'Failed to delete role');
      }
    } catch (err: any) {
      console.error('Error deleting role:', err);
      setError(err.response?.data?.message || err.message || 'Error deleting role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getRoles]);

  return {
    roles,
    loading,
    error,
    getRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole
  };
};
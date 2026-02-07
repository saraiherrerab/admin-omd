import { useState, useCallback } from 'react';
import api from '../services/api';
import type  { Coupon, CouponFilters } from '../types/coupons';

export const useCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
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
  

  const getCoupons = useCallback(async (filters: CouponFilters) => {
    setLoading(true);
    setError(null);
    try {
        // Remove empty strings, null, and undefined values from params
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      );
      const response = await api.get(`/coupons/search`, { params });
      if (response.data.success) {
        setCoupons(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError(response.data.message || 'Failed to fetch coupons');
      }
    } catch (err: any) {
      console.error('Error fetching coupons:', err);
      setError(err.response?.data?.message || err.message || 'Error fetching permissions');
    } finally {
      setLoading(false);
    }
  }, []);

  const getCoupon = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/coupons/${id}`);
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
    coupons,
    loading,
    error,
    getCoupons,
    getCoupon,
    pagination,
  };
};
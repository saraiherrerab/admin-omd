import { useState, useCallback } from 'react';
import api from '../services/api';
import type  { Coupon, CouponFilters, CreateCouponDTO } from '../types/coupons';
import axios from 'axios';

export const useCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [specialCoupons, setSpecialCoupons] = useState<Coupon[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
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
        setCoupon(response.data.data);
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

  const deleteCoupon = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/coupons/${id}`);
      if (response.data.success) {
        setCoupons((prev) => prev.filter((coupon) => coupon.id !== id));
        return response.data.data;
      }
      return null;
    } catch (err: any) {
      console.error(`Error deleting role ${id}:`, err);
      setError(err.response?.data?.message || err.message || 'Error deleting role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCoupon = useCallback(async (coupon: CreateCouponDTO) => {
    setLoading(true);
    setError(null);
    try {
      console.log(coupon);
      const response = await api.post(`/coupons`, coupon);
      if (response.data.success) {
        console.log(response.data);
        setCoupons((prev) => [response.data.data, ...prev]);
        return response;

      }
      return null;

    } catch (err: any) {
      console.error(`Error creating role:`, err);
      setError(err.response?.data?.message || err.message || 'Error creating role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

// Provisional para buscar cupones en la base de datos de VPS porque el backend local no tiene esta parte correcta, se deberia usar getCoupons
  const specialGetCoupons = useCallback(async (filters: CouponFilters) => {
    setLoading(true);
    setError(null);
    try {
        // Remove empty strings, null, and undefined values from params
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      ); 
      const response = await axios.get('http://15.204.232.20:7234/coupons', { params });
     
       // console.log(response.data);
        setSpecialCoupons(response.data.data);
        setPagination(response.data.meta);
     
    } catch (err: any) {
      console.error('Error fetching coupons:', err);
      setError(err.response?.data?.message || err.message || 'Error fetching permissions');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCoupon = useCallback(async (id: number, coupon: CreateCouponDTO) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/coupons/${id}`, coupon);
      if (response.data.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? response.data.data : c))
        );
        return response;
      }
      return null;
    } catch (err: any) {
      console.error(`Error updating coupon:`, err);
      setError(err.response?.data?.message || err.message || 'Error updating coupon');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    coupons,
    coupon,
    loading,
    error,
    getCoupons,
    getCoupon,
    pagination,
    deleteCoupon,
    createCoupon,
    updateCoupon,
    specialGetCoupons,
    specialCoupons,
  };
};
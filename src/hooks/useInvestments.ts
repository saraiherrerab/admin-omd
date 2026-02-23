import { useState, useCallback, useEffect } from 'react';
import api from '@/services/api';
import type { Investment, InvestmentResponse } from '@/types/investments'; 

export const useInvestments = (initialPoolId?: string) => {
    const [data, setData] = useState<Investment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const fetchInvestments = useCallback(async (params: { page?: number; limit?: number; search?: string; poolId?: string } = {}) => {
        setLoading(true);
        setError(null);
        try {
            const { page = 1, limit = 10, search = '', poolId = initialPoolId } = params;
            
            // Map frontend pool ID to backend enum
            const mapPoolId = (id: string) => {
                switch(id?.toUpperCase()) {
                    case 'USDT': return 'POOL_USDT';
                    case 'OMD':
                    case 'OMD3': return 'POOL_OMD';
                    case 'OMDB': return 'POOL_OMDB';
                    default: return undefined;
                }
            };

            const backendPoolId = mapPoolId(poolId);
            
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });

            if (backendPoolId) {
                queryParams.append('pool_id', backendPoolId);
            }

            // Only append valid search params that backend supports
            if (search) {
                // Check if search is a UUID (for deposit_id)
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (uuidRegex.test(search)) {
                    queryParams.append('deposit_id', search);
                }
                // If backend supports generic search in future, add 'q' here
                // queryParams.append('q', search); 
            }

            // Always use search endpoint for filtering
            const url = '/investments/search';

            const response = await api.get<InvestmentResponse>(`${url}?${queryParams.toString()}`);
            
            // Backend format variation handling - adjust based on actual response
            const responseData = response.data;
            
            // Map backend response (snake_case) to frontend model (camelCase)
            const mappedData = (responseData.data || []).map((item: any) => ({
                ...item, // Keep original properties
                // Map snake_case to camelCase
                userId: item.user_id || item.userId,
                poolId: item.pool_id || item.poolId,
                amount: item.allocated_amount ?? item.amount,
                yieldRate: item.yield_rate ?? item.yieldRate,
                status: item.status, // Usually same
                startDate: item.confirmed_at || item.start_at || item.created_at || item.startDate,
                endDate: item.end_date || item.endDate,
                // Ensure ID is string
                id: item.id || item.investment_id
            }));

            setData(mappedData);
            setPagination({
                page: responseData.page || page,
                limit: responseData.limit || limit,
                total: responseData.total || 0,
                totalPages: responseData.totalPages || 0
            });

        } catch (err: any) {
             console.error('Error fetching investments:', err);
             setError(err.message || 'Failed to fetch investments');
             // Fallback to empty state on error for UI resilience
             setData([]);
        } finally {
            setLoading(false);
        }
    }, [initialPoolId]);

    const getInvestmentById = useCallback(async (id: string) => {
        try {
            const response = await api.get<Investment>(`/investments/${id}`);
            return response.data;
        } catch (err: any) {
            throw new Error(err.message || 'Failed to fetch investment details');
        }
    }, []);

    const createInvestment = useCallback(async (investmentData: Partial<Investment>) => {
        try {
            const response = await api.post<Investment>('/investments', investmentData);
            // Optimistic update or refetch could happen here
            fetchInvestments({ page: pagination.page, limit: pagination.limit, poolId: initialPoolId }); 
            return response.data;
        } catch (err: any) {
            throw new Error(err.message || 'Failed to create investment');
        }
    }, [fetchInvestments, pagination, initialPoolId]);


    return {
        investments: data,
        loading,
        error,
        pagination,
        fetchInvestments,
        getInvestmentById,
        createInvestment
    };
};

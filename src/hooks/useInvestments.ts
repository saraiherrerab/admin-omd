import { useState, useCallback } from 'react';
import api from '@/services/api';
import type { Investment, InvestmentResponse } from '@/types/investments'; 
import { UserService } from '@/services/userService';

// Helper to format invalid dates
const formatDate = (dateString?: string) => {
    if (!dateString) return new Date();
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? new Date() : d; 
};

const formatCurrency = (amount: any) => {
    const num = Number(amount);
    return isNaN(num) ? 0 : num;
}

export const useInvestments = (initialPoolId?: string) => {
    const [data, setData] = useState<Investment[]>([]);
    const [stats, setStats] = useState({
        totalInvested: 0,
        totalReturn: 0,
        activeCount: 0,
        totalCount: 0,
        avgRate: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const fetchStats = useCallback(async (poolId?: string) => {
        try {
             // Map frontend pool ID to backend enum - duplication I know but cleaner than extracting for now
            const mapPoolId = (id?: string) => {
                switch(id?.toUpperCase()) {
                    case 'USDT': return 'POOL_USDT';
                    case 'OMD':
                    case 'OMD3': return 'POOL_OMD';
                    case 'OMDB': return 'POOL_OMDB';
                    default: return undefined;
                }
            };
            const backendPoolId = mapPoolId(poolId || initialPoolId);
            const queryParams = new URLSearchParams();
            if (backendPoolId) queryParams.append('pool_id', backendPoolId);

            const response = await api.get(`/investments/statistics?${queryParams.toString()}`);
            if (response.data && response.data.success) {
                const raw = response.data.data;
                setStats({
                    totalInvested: raw.total_invested || 0,
                    totalReturn: raw.total_return || 0,
                    activeCount: raw.active_investments || 0,
                    totalCount: raw.total_investments || 0,
                    avgRate: raw.average_rate || 0
                });
            }
        } catch (e) {
            console.error("Failed to fetch investment stats", e);
        }
    }, [initialPoolId]);


    const fetchInvestments = useCallback(async (params: { page?: number; limit?: number; search?: string; poolId?: string } = {}) => {
        setLoading(true);
        setError(null);
        try {
            const { page = 1, limit = 10, search = '', poolId = initialPoolId } = params;
            
            if (page === 1) fetchStats(poolId);
            
            // Map frontend pool ID to backend enum
            const mapPoolId = (id?: string) => {
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
            }

            // Always use search endpoint for filtering
            const url = '/investments/search';

            const response = await api.get<InvestmentResponse>(`${url}?${queryParams.toString()}`);
            
            // Backend format variation handling - adjust based on actual response
            const responseData = response.data;
            
            // Map backend response (snake_case) to frontend model (camelCase)
            // Use Promise.all to fetch user details in parallel
            const mappedDataPromises = (responseData.data || []).map(async (item: any) => {
                let userDetails = item.user;
                
                // Try all possible fields for user ID
                const userId = item.user_id || item.userId || item.investor_id || item.owner_id || item.client_id || item.account_id || (userDetails && userDetails.id);

                // Fetch user details if missing and we have an ID
                if ((!userDetails || (userDetails && !userDetails.name)) && userId && userId !== 'N/A') {
                    try {
                         // Only fetch if it looks like a valid ID (number or non-empty string)
                         if (Number(userId) > 0 || (typeof userId === 'string' && userId.length > 0)) {
                             const fetchedUser = await UserService.getUserById(userId);
                             
                             if (fetchedUser && fetchedUser.name && fetchedUser.name !== 'N/A') {
                                 userDetails = fetchedUser;
                             } else {
                                // Fallback to ID substring if fetch failed or returned nothing useful
                                userDetails = { ...fetchedUser, id: userId, name: `User ${String(userId).substring(0, 8)}...` };
                             }
                         }
                    } catch (e) {
                         console.warn('Failed to fetch user for investment', item.id, e);
                         userDetails = { id: userId, name: `ID: ${String(userId).substring(0, 8)}...` };
                    }
                } else if (!userDetails && userId) {
                     // We have ID perfectly but failed to logic fetching? (Shouldn't happen with above if)
                     // Or maybe ID is 'N/A'
                     userDetails = { name: 'N/A' };
                }

                return {
                    ...item, // Keep original properties
                    // Map snake_case to camelCase
                    userId: userId,
                    poolId: item.pool_id || item.poolId,
                    amount: formatCurrency(item.allocated_amount ?? item.amount),
                    yieldRate: item.yield_rate ?? item.yieldRate,
                    status: item.status, // Usually same
                    startDate: formatDate(item.confirmed_at || item.start_at || item.created_at || item.startDate).toISOString(), 
                    endDate: item.end_date || item.endDate,
                    // Ensure ID is string
                    id: item.id || item.investment_id,
                    user: userDetails || { id: userId, name: userId && userId!=='N/A' ? `User ${String(userId).substring(0, 8)}` : 'N/A' }
                };
            });

            const mappedData = await Promise.all(mappedDataPromises);

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
        stats,
        loading,
        error,
        pagination,
        fetchInvestments,
        fetchStats,
        getInvestmentById,
        createInvestment
    };
};

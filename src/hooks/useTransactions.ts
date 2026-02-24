import { useState, useCallback } from 'react';
import api from '@/services/api';
import type { Transaction } from '@/types/transactions'; 
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

// Helper to batch promises
// const batchPromises = async <T>(items: any[], batchSize: number, fn: (item: any) => Promise<T>): Promise<T[]> => {
//    const results: T[] = [];
//    for (let i = 0; i < items.length; i += batchSize) {
//        const batch = items.slice(i, i + batchSize);
//        const batchResults = await Promise.all(batch.map(fn));
//        results.push(...batchResults);
//    }
//    return results;
// };

export const useTransactions = (initialPoolId?: string) => {
    const [data, setData] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false
    });

    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        failed: 0,
        totalAmount: 0
    });

    const fetchStats = useCallback(async (poolId?: string) => {
        try {
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

            const response = await api.get(`/transactions/statistics?${queryParams.toString()}`);
            if (response.data?.success) {
                // Map backend stats to frontend structure
                // Assuming backend returns { total: X, status_counts: { COMPLETED: Y, ... } } or similar
                // If structure is unknown, we map nicely
                const raw = response.data.data || {};
                setStats({
                    total: raw.total || 0,
                    completed: raw.completed || raw.status_counts?.COMPLETED || 0,
                    pending: raw.pending || raw.status_counts?.PENDING || 0,
                    failed: raw.failed || raw.status_counts?.FAILED || 0,
                    totalAmount: raw.total_amount || 0
                });
            }
        } catch (e) {
            console.error("Failed to fetch transaction stats", e);
        }
    }, [initialPoolId]);

    const fetchTransactions = useCallback(async (params: { page?: number; limit?: number; search?: string; poolId?: string } = {}) => {
        setLoading(true);
        setError(null);
        try {
            const { page = 1, limit = 10, search = '', poolId = initialPoolId } = params;
            
            // Fetch stats in parallel if first page
            if (page === 1) fetchStats(poolId);
            
            // ... (mapping poolId logic remains) ...
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

            if (backendPoolId) queryParams.append('pool_id', backendPoolId);
            // Basic search handling
            if (search) {
                // ... (search logic) ...
                 const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (uuidRegex.test(search)) {
                    queryParams.append('reference_id', search);
                }
            }

            const response = await api.get<any>(`/transactions/search?${queryParams.toString()}`);
            const responseData = response.data;
            const transactionsList = responseData.data || responseData || [];

            // Initial immediate display - Mapeo rápido síncrono
            const initialData = transactionsList.map((item: any) => {
                const amount = formatCurrency(item.amount);
                const fee = formatCurrency(item.fee);
                // Try all possible fields for user ID
                const userId = item.user_id || item.userId || item.owner_id || item.client_id || item.account_id;

                return {
                    id: item.id || item.transaction_id,
                    amount,
                    fee,
                    net: amount - fee,
                    currency: item.currency || 'USD',
                    status: item.status,
                    type: item.type || item.transaction_type || 'Unknown',
                    txHash: item.tx_hash || item.hash,
                    toAddress: item.to_address,
                    date: formatDate(item.created_at || item.createdAt || item.date).toISOString(),
                    userId: userId,
                    poolId: item.pool_id || item.poolId,
                    user: item.user || { name: 'Cargando...' } // Placeholder
                };
            });

            setData(initialData);

            // Pagination Logic
            const total = Number(responseData.total) || 0;
            const currentLimit = Number(responseData.limit) || limit;
            const calculatedTotalPages = currentLimit > 0 ? Math.ceil(total / currentLimit) : 0;
            const hasNextPage = transactionsList.length >= limit;
            const reliableTotalPages = total > 0 ? (responseData.totalPages || calculatedTotalPages) : 0;

            setPagination({
                page: Number(responseData.page) || page,
                limit: currentLimit,
                total: total,
                totalPages: reliableTotalPages,
                hasNextPage
            });

            setLoading(false); // UI Ready immediately

            // Background enrichment
            // We use a copy to mutate and update state
            let currentData = [...initialData];

            const processBatch = async (items: any[]) => {
                const updates = await Promise.all(items.map(async (item) => {
                    let userDetails = item.user;
                    // If user is not fully loaded
                    if ((!userDetails || userDetails.name === 'Cargando...') && item.userId && item.userId !== 'N/A') {
                        try {
                            const fetchedUser = await UserService.getUserById(item.userId);
                            userDetails = fetchedUser || { id: item.userId, name: 'Unknown' };
                        } catch (e) {
                            userDetails = { id: item.userId, name: 'Error' };
                        }
                    }
                    return { ...item, user: userDetails };
                }));

                // Update data with new details
                // Find items in currentData and update them
                updates.forEach(updatedItem => {
                    const idx = currentData.findIndex(d => d.id === updatedItem.id);
                    if (idx !== -1) currentData[idx] = updatedItem;
                });
                
                setData([...currentData]);
            };

            // Process in background batches of 5
            (async () => {
                for (let i = 0; i < currentData.length; i += 5) {
                    const batch = currentData.slice(i, i + 5);
                    await processBatch(batch);
                    // Small delay between UI updates to not freeze browser if many items
                    await new Promise(r => setTimeout(r, 50)); 
                }
            })();

        } catch (err: any) {
            console.error('Error fetching transactions:', err);
            setError(err.message || 'Failed to fetch transactions');
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [initialPoolId]);

    const getTransactionById = useCallback(async (id: string) => {
        try {
            const response = await api.get<Transaction>(`/transactions/${id}`);
            return response.data;
        } catch (err: any) {
            throw new Error(err.message || 'Failed to fetch transaction details');
        }
    }, []);

    return {
        transactions: data,
        stats,
        loading,
        error,
        pagination,
        fetchTransactions,
        fetchStats,
        getTransactionById
    };
};

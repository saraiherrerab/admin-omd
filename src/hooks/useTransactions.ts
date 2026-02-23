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
const batchPromises = async <T>(items: any[], batchSize: number, fn: (item: any) => Promise<T>): Promise<T[]> => {
    const results: T[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(fn));
        results.push(...batchResults);
    }
    return results;
};

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

    const fetchTransactions = useCallback(async (params: { page?: number; limit?: number; search?: string; poolId?: string } = {}) => {
        setLoading(true);
        setError(null);
        try {
            const { page = 1, limit = 10, search = '', poolId = initialPoolId } = params;
            
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

            // Process transactions in batches of 5 to avoid 429s (even with caching)
            const processTransaction = async (item: any) => {
                 let userDetails = item.user;
                 // Try all possible fields for user ID
                const userId = item.user_id || item.userId || item.owner_id || item.client_id || item.account_id;

                 if ((!userDetails || !userDetails.name) && userId && userId !== 'N/A') {
                    try {
                         if (Number(userId) > 0 || (typeof userId === 'string' && userId.length > 0)) {
                             const fetchedUser = await UserService.getUserById(userId);
                             userDetails = fetchedUser || { id: userId, name: 'Unknown' };
                         }
                    } catch (e) {
                         console.warn('Failed to fetch user', userId);
                         userDetails = { id: userId, name: 'Error' };
                    }
                } else if (!userDetails) {
                    userDetails = { name: 'N/A' };
                }

                // Format amount/fee
                const amount = formatCurrency(item.amount);
                const fee = formatCurrency(item.fee);

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
                    user: userDetails
                };
            };
            
            const mappedData = await batchPromises(transactionsList, 5, processTransaction);

            // Pagination Logic
            const total = Number(responseData.total) || 0;
            const currentLimit = Number(responseData.limit) || limit;
            const calculatedTotalPages = currentLimit > 0 ? Math.ceil(total / currentLimit) : 0;
            
            // If API doesn't return total, assume next page exists if we got full page
            const hasNextPage = transactionsList.length >= limit;
            const reliableTotalPages = total > 0 ? (responseData.totalPages || calculatedTotalPages) : 0;

            setData(mappedData);
            setPagination({
                page: Number(responseData.page) || page,
                limit: currentLimit,
                total: total,
                totalPages: reliableTotalPages,
                hasNextPage
            });

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
        loading,
        error,
        pagination,
        fetchTransactions,
        getTransactionById
    };
};

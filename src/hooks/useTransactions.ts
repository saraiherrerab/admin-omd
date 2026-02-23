import { useState, useCallback } from 'react';
import api from '@/services/api';
import type { Transaction, TransactionResponse } from '@/types/transactions'; 
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

export const useTransactions = (initialPoolId?: string) => {
    const [data, setData] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const fetchTransactions = useCallback(async (params: { page?: number; limit?: number; search?: string; poolId?: string } = {}) => {
        setLoading(true);
        setError(null);
        try {
            const { page = 1, limit = 10, search = '', poolId = initialPoolId } = params;
            
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

            // Transaction search schema supports user_id, pool_id, status, currency, refence_id
            // If searching by deposit_id is needed, we would add another Param
            if (search) {
                // If search looks like UUID, try as reference or user_id
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (uuidRegex.test(search)) {
                     // Since backend schema has specific fields, we might need to guess based on input
                     // For now, let's assume it could be reference ID if it's UUID
                    queryParams.append('reference_id', search);
                } else if (search.startsWith('0x')) {
                     // Maybe a hash?
                     // queryParams.append('tx_hash', search); // If supported
                }
            }

            // Always use search endpoint for filtering
            const url = '/transactions/search';

            const response = await api.get<TransactionResponse>(`${url}?${queryParams.toString()}`);
            
            const responseData = response.data;
            
            // Map backend response (snake_case) to frontend model (camelCase)
            const mappedDataPromises = (responseData.data || []).map(async (item: any) => {
                let userDetails = item.user;
                
                // Try all possible fields for user ID
                const userId = item.user_id || item.userId || item.owner_id || item.client_id || item.account_id;

                // Fetch user details if missing and we have an ID
                if ((!userDetails || !userDetails.name) && userId && userId !== 'N/A') {
                    try {
                         if (Number(userId) > 0 || (typeof userId === 'string' && userId.length > 0)) {
                             const fetchedUser = await UserService.getUserById(userId);
                             if (fetchedUser && fetchedUser.name !== 'N/A') {
                                 userDetails = fetchedUser;
                             } else {
                                userDetails = { ...fetchedUser, id: userId, name: `User ${String(userId).substring(0, 8)}...` };
                             }
                         }
                    } catch (e) {
                         console.warn('Failed to fetch user for transaction', item.id, e);
                         userDetails = { id: userId, name: `ID: ${String(userId).substring(0, 8)}...` };
                    }
                } else if (!userDetails) {
                    userDetails = { name: 'N/A' };
                }

                const amount = formatCurrency(item.amount);
                const fee = formatCurrency(item.fee || 0); // Assuming fee might come from backend

                return {
                    ...item,
                    userId: userId,
                    poolId: item.pool_id || item.poolId,
                    amount: amount,
                    fee: fee,
                    net: amount - fee, // Calculate net if not provided
                    currency: item.currency || 'USD', // Default if missing
                    status: item.status, 
                    type: item.type || item.transaction_type || 'Unknown',
                    txHash: item.tx_hash || item.hask,
                    toAddress: item.to_address,
                    date: formatDate(item.created_at || item.createdAt || item.date).toISOString(),
                    // Ensure ID is string
                    id: item.id || item.transaction_id,
                    user: userDetails
                };
            });

            const mappedData = await Promise.all(mappedDataPromises);

            const total = responseData.total || 0;
            const currentLimit = responseData.limit || limit;
            const calculatedTotalPages = currentLimit > 0 ? Math.ceil(total / currentLimit) : 0;
            const totalPages = responseData.totalPages || calculatedTotalPages;

            setData(mappedData);
            setPagination({
                page: Number(responseData.page) || page,
                limit: Number(currentLimit) || limit,
                total: Number(total),
                totalPages: Number(totalPages)
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

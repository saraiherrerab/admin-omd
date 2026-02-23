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
            // First map the basic data synchronously as much as possible
            const initialMappedData = (responseData.data || []).map((item: any) => {
                 let userDetails = item.user;
                 const userId = item.user_id || item.userId || item.owner_id || item.client_id || item.account_id;
                 
                 // Placeholder while fetching
                 if ((!userDetails || !userDetails.name) && userId && userId !== 'N/A') {
                     userDetails = { id: userId, name: 'Cargando...', _needsFetch: true };
                 } else if (!userDetails) {
                     userDetails = { name: 'N/A' };
                 }

                 return {
                    ...item,
                    userId: userId,
                    poolId: item.pool_id || item.poolId,
                    amount: formatCurrency(item.amount),
                    fee: formatCurrency(item.fee || 0),
                    net: formatCurrency(item.amount) - formatCurrency(item.fee || 0),
                    currency: item.currency || 'USD',
                    status: item.status,
                    type: item.type || item.transaction_type || 'Unknown',
                    txHash: item.tx_hash || item.hask,
                    toAddress: item.to_address,
                    date: formatDate(item.created_at || item.createdAt || item.date).toISOString(),
                    id: item.id || item.transaction_id,
                    user: userDetails
                };
            });

            // Identify users that need fetching
            const usersToFetch = initialMappedData
                .filter((item: any) => item.user._needsFetch)
                .map((item: any) => item.userId);
            
            // Deduplicate IDs
            const uniqueUserIds = [...new Set(usersToFetch)] as string[];

            // Fetch users with concurrency limit (e.g., 3 at a time)
            if (uniqueUserIds.length > 0) {
                const fetchUser = async (id: string) => {
                    try {
                        if (Number(id) > 0 || (typeof id === 'string' && id.length > 0)) {
                            return await UserService.getUserById(id);
                        }
                    } catch (e) { /* ignore */ }
                    return null;
                };

                // Execute in batches of 3
                const batchSize = 3;
                for (let i = 0; i < uniqueUserIds.length; i += batchSize) {
                    const batch = uniqueUserIds.slice(i, i + batchSize);
                    await Promise.all(batch.map(fetchUser)); // UserService caches the result
                }
            }
            
            // Re-map with fetched user data (from cache)
            const finalMappedData = await Promise.all(initialMappedData.map(async (item: any) => {
                if (item.user._needsFetch) {
                    try {
                        const user = await UserService.getUserById(item.userId);
                        return { ...item, user: user.name && user.name !== 'N/A' ? user : { ...user, name: `User ${String(item.userId).substring(0, 8)}...` } };
                    } catch {
                        return { ...item, user: { id: item.userId, name: `ID: ${String(item.userId).substring(0, 8)}...` } };
                    }
                }
                return item;
            }));

            let currentPage = Number(responseData.page) || page;
            let currentLimit = Number(responseData.limit) || limit;
            let currentTotal = Number(responseData.total);
            let totalPages = Number(responseData.totalPages);

            // Correct handling for unknown total:
            // If backend provides 0 total but we have data, it means total is unknown.
            // We shouldn't fake a growing total, but we can indicate if there's *likely* a next page.
            // Since our Pagination component expects totalPages, we have to pass something or null.
            
            if (!currentTotal && finalMappedData.length > 0) {
                 // Unknown total
                 currentTotal = 0; 
                 totalPages = 0; // Use 0 to signal "unknown"
            }

            setData(finalMappedData);
            setPagination({
                page: currentPage,
                limit: currentLimit,
                total: currentTotal,
                totalPages: totalPages
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

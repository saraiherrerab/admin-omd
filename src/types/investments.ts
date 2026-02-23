export interface InvestmentUser {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
}

export interface Investment {
    id: string;
    userId: string;
    poolId: string;
    asset: string;
    type: string; // 'Cripto', 'Acciones', 'ETF', etc.
    method: string; // Payment method or investment channel
    amount: number;
    yieldRate: number; // Percentage
    estReturn: number; // Calculated amount
    status: 'Active' | 'Pending' | 'Closed' | 'Activo' | 'Pendiente' | 'Cerrado';
    startDate: string; // ISO Date
    endDate?: string; // ISO Date
    
    // Expanded details for dialog
    interestRate?: string;
    totalEarned?: number;
    lastPayment?: number;
    withReturn?: boolean;
    balance?: number;

    // Populated fields
    user?: InvestmentUser;
}

export interface InvestmentFilters {
    search?: string;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    poolId?: string;
    userId?: string;
    page?: number;
    limit?: number;
}

export interface InvestmentResponse {
    data: Investment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

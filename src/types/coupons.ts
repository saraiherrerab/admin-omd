export interface Coupon {
    id: number;
    code: string;
    amount: number;
    is_redeemed: boolean;
    redeemed_by: number;
    expiration_date: Date;
    created_at: Date;
    updated_at: Date;
    updated_by: number;
    created_by: number;
    pool: string;
    token: string;
    with_return: boolean;
    status: string;
    promotion_id: number;
    start_date: Date;
    
    creator: {
        id: number;
        email: string;
        username: string;
    };
    assigned_user: {
        id: number;
        email: string;
        username: string;
    };
}


export interface CouponFilters {
    page?: number;
    limit?: number;
    code?: string;
    token?: string;
    is_redeemed?: boolean;
    redeemed_by?: number;
    min_amount?: number;
    max_amount?: number;
    expires_after?: string;
    expires_before?: string;
    created_after?: string;
    created_before?: string; 
    pool?: string;
    returnable?: boolean;
}

export interface CreateCouponDTO {
    code: string;
    pool: string; 
    amount: number;
    status?: string;
    start_date?: string;
    expiration_date?: string;
    is_redeemed?: boolean;
    promotion_id?: number;
    with_return?: boolean;
    token?: string;
    user_id?: number;
}

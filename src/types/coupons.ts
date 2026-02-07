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
    expires_after?: Date;
    expires_before?: Date;
    created_after?: Date;
    created_before?: Date; 
    pool?: string;
    returnable?: boolean;
}

export interface CreateCouponDTO {
    code: string;
    pool: string; 
    amount: number;
    status: string;
    start_date: Date;
    expiration_date: Date;
    is_redeemed?: boolean;
    promo?: number;
    with_return: boolean;
    currency?: string;
    creator: {
        id: number;
        email: string;
        username: string;
    };
    assigned_user?: {
        id: number;
        email: string;
        username: string;
    };
}

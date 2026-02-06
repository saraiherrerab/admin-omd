import type { Role } from "./roles";

export interface User {
    id: number;
    email: string;
    username: string;
    name: string;
    lastname: string; 
    balance: string | number;
    phone: string;
    password?: string; // Optional as it might not always be returned
    roles:  Pick<Role, 'id' | 'name'>[]; 
    status: string;
    createdAt: Date;
    updatedAt: Date;
    roleDetails: Role[];
}
export interface UserFilters {
    includeRoles?: boolean;
    page?: number;
    limit?: number;
    name?: string;
    username?: string;
    email?: string;
    lastname?: string;
    balance?: number | string;
    role?: number | string;
    includePermissions?: boolean;
}

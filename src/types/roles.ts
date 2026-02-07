import type { Permission } from './permissions';
export type { Permission };

export interface Role {
  id: number;
  name: string;
  description: string; 
  status: string;
  permissions: Permission[];
  created_at: string;
}

export interface CreateRoleDTO {
  name: string;
  description: string;
  permissions: number[]; // Array of permission IDs
}

export interface UpdateRoleDTO {
  name?: string;
  description?: string;
    permissions?: number[];   
}

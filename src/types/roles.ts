export interface Permission {
  id: number;
  name: string;
  description: string;
  classification: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  hierarchy_level: number;
  status: string;
  permissions: Permission[];
  created_at: string;
}

export interface CreateRoleDTO {
  name: string;
  description: string;
  hierarchy_level: number;
  permissions: number[]; // Array of permission IDs
}

export interface UpdateRoleDTO {
  name?: string;
  description?: string;
    permissions?: number[]; 
  hierarchy_level?: number;
}

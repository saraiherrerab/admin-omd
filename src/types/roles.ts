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
  permissions: Permission[];
}

export interface CreateRoleDTO {
  name: string;
  description: string;
  permissions: string[]; // Array of permission IDs
}

export interface UpdateRoleDTO {
  name?: string;
  description?: string;
  permissions?: string[]; // Array of permission IDs
}

import api from './api';

export interface User {
  id: string;
  name?: string;
  username?: string;
  email: string;
}

export const UserService = {
  getUserById: async (id: string): Promise<User> => {
    try {
        const response = await api.get<{ data: User }>(`/users/${id}`);
        // Backend returns user details directly or wrapped in data
        const userData = response.data.data || response.data;
        return {
            ...userData,
            // Fallback for name if backend uses different field or it's missing
            name: userData.name || userData.username || 'Usuario'
        };
    } catch (error) {
        console.error(`Error fetching user ${id}:`, error);
        return { id, email: '', name: 'N/A' };
    }
  }
};

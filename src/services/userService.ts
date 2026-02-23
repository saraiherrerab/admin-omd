import api from './api';

export interface User {
  id: string;
  name?: string;
  username?: string;
  email: string;
}

// Simple in-memory cache
const userCache = new Map<string, Promise<User>>();
const REQUEST_DELAY = 50; // ms

export const UserService = {
  getUserById: async (id: string): Promise<User> => {
    // If request already pending or cached, reuse it
    if (userCache.has(id)) {
      return userCache.get(id)!;
    }

    const promise = (async () => {
        // Add slight delay to distribute requests
        await new Promise(resolve => setTimeout(resolve, Math.random() * REQUEST_DELAY));
        
        try {
            const response = await api.get<any>(`/users/${id}`);
            const userData = response.data.data || response.data;
            
            const user = {
                id: userData.id,
                email: userData.email,
                name: (userData.name && userData.lastname ? `${userData.name} ${userData.lastname}` : userData.name) || userData.username || 'Usuario'
            };
            return user;
        } catch (error) {
            console.error(`Error fetching user ${id}:`, error);
            // Don't cache errors forever, maybe retry later? For now, avoid re-fetching immediately
            return { id, email: '', name: 'N/A' };
        }
    })();

    userCache.set(id, promise);
    return promise;
  }
};

# API Integration & Authentication Setup

## ✅ Complete Implementation

Your admin project now has full API integration with proper authentication, environment variables, and context management!

---

## 📦 What Was Created

### Environment Configuration
- **`.env`** - Environment variables (API URL)
- **`.env.example`** - Template for environment variables

### Services
- **`src/services/api.ts`** - Axios instance with interceptors
- **`src/services/authService.ts`** - Authentication API methods

### Types
- **`src/types/auth.ts`** - TypeScript type definitions

### Context & Hooks
- **`src/context/AuthContext.tsx`** - Updated with real API calls
- **`src/hooks/useUser.ts`** - Custom hook for user data access

---

## 🔒 Authentication Flow

### Login Process
1. User submits email/password from Login page
2. `AuthContext.login()` is called
3. API request to `POST /api/auth/login` with `username` and `password`
4. Backend returns JWT token (or sets cookie)
5. Token is stored in localStorage
6. Token is decoded to extract user info
7. User is redirected to home/dashboard

### Registration Process
1. User submits name, email, password from Register page
2. `AuthContext.register()` is called
3. API request to `POST /api/auth/register`
4. User is automatically logged in after successful registration

### Logout Process
1. User clicks logout button
2. `AuthContext.logout()` is called
3. API request to `POST /api/auth/logout` (clears cookie)
4. Token removed from localStorage
5. User state cleared
6. User redirected to login page

---

## 🌐 Environment Variables

### Setup
Your `.env` file is already created with:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Usage in Code
Access environment variables with:
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

**Important:** In Vite, environment variables must be prefixed with `VITE_` to be exposed to client-side code.

---

## 🔧 API Service

### Base Configuration
The API service (`src/services/api.ts`) includes:

- **Base URL**: From environment variable
- **Headers**: Content-Type JSON
- **Credentials**: Enabled for cookies (`withCredentials: true`)
- **Request Interceptor**: Automatically adds auth token to requests
- **Response Interceptor**: Handles 401 errors (auto-logout on expired token)

### Example Usage
```typescript
import api from '@/services/api';

// GET request
const response = await api.get('/users');

// POST request
const response = await api.post('/users', { name: 'John' });

// With auth token automatically included
const response = await api.get('/protected-route');
```

---

## 👤 Using Auth Context

### In Components

```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!isAuthenticated) return <div>Please login</div>;
  
  return (
    <div>
      <p>Welcome, {user?.name || user?.email}!</p>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Using the Custom Hook

```typescript
import { useUser } from '@/hooks/useUser';

function MyComponent() {
  const { 
    user, 
    userName, 
    userEmail, 
    userRole,
    isAdmin, 
    isAuthenticated 
  } = useUser();
  
  return (
    <div>
      {isAdmin && <AdminPanel />}
      <p>Hello, {userName}!</p>
    </div>
  );
}
```

---

## 🔑 API Endpoints

Based on your curl example, the API expects:

### Login
```typescript
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin1@gmail.com",  // Note: "username" not "email"
  "password": "12345678a#A"
}

Response: {
  "token": "jwt_token_here",
  "user": { ... }
}
```

### Other Expected Endpoints
```typescript
// Register
POST /api/auth/register
{
  "username": string,
  "password": string,
  "name": string,
  "email": string
}

// Logout
POST /api/auth/logout

// Verify Token
GET /api/auth/verify

// Refresh Token
POST /api/auth/refresh
```

---

## 🔐 Token Management

### Storage
- Tokens are stored in **localStorage** under the key `"token"`
- Format: `Bearer ${token}` automatically added to requests

### Automatic Injection
The API interceptor automatically adds the token to all requests:
```typescript
config.headers.Authorization = `Bearer ${token}`;
```

### Cookie Support
The API client is configured with `withCredentials: true`, so if your backend sets JWT as an HTTP-only cookie, it will work automatically.

### Expiration Handling
- Tokens are checked for expiration on app load
- 401 responses automatically clear token and redirect to login
- Manual refresh available via `refreshUser()` method

---

## 📝 Type Safety

### User Type
```typescript
interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  username?: string;
}
```

### JWT Payload Type
```typescript
interface JWTPayload extends User {
  iat?: number; // Issued at
  exp?: number; // Expiration time
}
```

---

## 🧪 Testing the Integration

### 1. Make sure your backend is running
```bash
# Your backend should be running on http://localhost:3000
```

### 2. Update the .env if needed
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Restart the dev server
The dev server needs to be restarted after changing .env files:
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 4. Test Login
1. Go to http://localhost:5173/login
2. Enter credentials: `admin1@gmail.com` / `12345678a#A`
3. Check browser console for API requests
4. Should redirect to dashboard on success

### 5. Test Registration
1. Go to http://localhost:5173/register
2. Fill in name, email, password
3. Check if API call is made
4. Should auto-login after registration

---

## 🐛 Debugging

### Check API Calls
Open browser DevTools → Network tab to see:
- Request URL
- Request headers (Authorization token)
- Request payload
- Response status
- Response data

### Check Console
The app logs errors to console:
- Login errors
- Registration errors
- Token validation errors
- API request errors

### Check Token
In browser DevTools → Application → Local Storage:
- Key: `token`
- Value: JWT token string
- Click to see decoded content

### CORS Issues
If you see CORS errors, make sure your backend has:
```javascript
// Express.js example
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

## 🚀 Production Checklist

### Environment Variables
- [ ] Create `.env.production` with production API URL
- [ ] Never commit `.env` to version control
- [ ] Add `.env` to `.gitignore`

### Security
- [ ] Use HTTPS in production
- [ ] Set secure HTTP-only cookies for JWT
- [ ] Implement token refresh mechanism
- [ ] Add rate limiting to login endpoint
- [ ] Validate all user inputs

### Error Handling
- [ ] Display user-friendly error messages
- [ ] Log errors to monitoring service
- [ ] Handle network failures gracefully

---

## 📚 Next Steps

✅ **API integration complete**
✅ **Environment variables configured**
✅ **Auth context with real API**
✅ **Type-safe authentication**
✅ **Custom hooks for convenience**

### Future Enhancements:
- Token refresh implementation
- Remember me functionality (longer expiration)
- Password reset flow
- Email verification
- Two-factor authentication
- Protected routes based on user roles

---

## 🎉 You're Ready!

Your authentication system is now connected to your backend API. Test it by logging in with your credentials!

**Important:** Make sure your backend is running on `http://localhost:3000` before testing.

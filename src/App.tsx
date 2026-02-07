import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Home from '@/pages/Principal/Home'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Users } from '@/pages/Principal/Users'
import { RolesAndPermissions } from './pages/Principal/RolesAndPermissions'
import { Coupons } from './pages/Principal/Coupons'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Home />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard/users" element={<Users />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard/rolesAndPermissions" element={<RolesAndPermissions />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard/coupons" element={<Coupons />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App

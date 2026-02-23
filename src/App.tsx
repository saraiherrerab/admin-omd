import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import Home from '@/pages/Principal/Home'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Users } from '@/pages/Principal/Users'
import { RolesAndPermissions } from './pages/Principal/RolesAndPermissions'
import { Coupons } from './pages/Principal/Coupons'
import { PoolClosures } from './pages/Principal/PoolClosures'
import { Workers } from '@/pages/Principal/Workers'
import { Transactions as PoolUSDTTransactions } from '@/pages/PoolUSDT/Transactions'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

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

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard/poolOMDB/closures" element={<PoolClosures />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard/poolOMDB/workers" element={<Workers />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard/poolUSDT/transactions" element={<PoolUSDTTransactions />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App

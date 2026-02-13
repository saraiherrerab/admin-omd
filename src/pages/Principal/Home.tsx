import { Layout } from '@/components/Layout'
import { useUser } from '@/hooks/useUser'

export default function Home() {
  const { user } = useUser()
  return (
    <Layout>
      <h1>Home</h1>
      <p>Bienvenido {user?.name}</p>
      {/* <p>Tu rol es: {user?.roles[0].id}</p> */}
      {/* <p>Tus permisos son: {user?.permissions.map(p => p.name).join(', ')}</p> */}
    </Layout>
  )
}

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LayoutDashboard, Settings, Users } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { useLanguage } from '@/hooks/useLanguage'

export default function Home() {
  const { t } = useLanguage()
  return (
    <Layout>
      <h1>Home</h1>
    </Layout>
  )
}

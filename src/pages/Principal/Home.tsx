import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { LayoutDashboard, Settings, Users } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { useLanguage } from '@/hooks/useLanguage'

export default function Home() {
  const { t } = useLanguage()
  return (
      <Layout>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('home.totalUsers')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">{t('home.userGrowth')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('home.activeSessions')}</CardTitle>
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">{t('home.sessionGrowth')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('home.settings')}</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{t('home.config')}</div>
              <p className="text-xs text-muted-foreground">{t('home.systemStatus')}</p>
            </CardContent>
          </Card>
      </Layout>
  )
}

import { useAuth } from "@/context/AuthContext"
import { Button } from "./Button"
import { LanguageSelectorDropdown } from "./LanguageSelectorDropdown"
import { useLanguage } from "@/hooks/useLanguage"
import { LogOut, Menu } from "lucide-react"

export const Header = ({
    onMenuClick,
}: {
    onMenuClick: () => void;
}) => {
    const { user, logout } = useAuth()
    const { t } = useLanguage()

    return (
        <header className="flex items-center justify-between p-6 md:p-2 mb-0">
            <div className="flex items-center gap-4">

                <Button variant="outline" size="sm" className="h-9 w-9 p-0" onClick={onMenuClick}><Menu className="h-4 w-4" /></Button>
                <p className="font-semibold text-lg">
                    OMD Admin Panel
                </p>
            </div>
            {/* Only show in desktop move to sidebar on mobile */}

            <div className="flex items-center gap-4 hidden md:flex">

                <p className="text-sm text-muted-foreground">{t('home.welcome')}, {user?.name}</p>


                <LanguageSelectorDropdown />
                <Button onClick={logout} variant="outline" size="sm">{t('common.logout')}
                    <LogOut className="h-4 w-4" />

                </Button>
            </div>
        </header>
    )
}
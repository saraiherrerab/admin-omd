import { useAuth } from "@/context/AuthContext";
import { LogOut, X } from "lucide-react";
import { Button } from "./Button";
import { LanguageSelectorDropdown } from "./LanguageSelectorDropdown";
import { useLanguage } from "@/hooks/useLanguage";

export const Sidebar = ({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) => {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out shadow-lg ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <span className="font-semibold text-lg">{t('common.menu')}</span>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <nav className="p-4 flex flex-col gap-6 h-[calc(100vh-65px)] overflow-y-auto">
                    {/* User Info Section in Sidebar for Mobile/Tablet or if Desktop header hides it */}
                    <div className="flex flex-col gap-4">
                        <div className="p-4 rounded-lg bg-muted/50">
                            <p className="font-medium">{user?.name}</p>
                            <p className="text-xs text-muted-foreground break-all">{user?.email}</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t('home.settings')}
                            </label>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">{t('common.language')}</span>
                                <LanguageSelectorDropdown />
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-border">
                            <Button onClick={logout} variant="outline" className="w-full justify-start gap-2">
                                {t('common.logout')}
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </nav>
            </aside>
        </>
    )
}

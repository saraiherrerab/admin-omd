import { useState } from 'react';
import { useAuth } from "@/context/AuthContext";
import { ChevronDown, Database, Gift, Headset, Home, Layers, LogOut, Mail, Wallet, X } from "lucide-react";
import { Button } from "./Button";
import { LanguageSelectorDropdown } from "./LanguageSelectorDropdown";
import { useLanguage } from "@/hooks/useLanguage";
import { NavLink, useLocation } from "react-router-dom";

export const Sidebar = ({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) => {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const location = useLocation();

    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

    const toggleSubmenu = (path: string) => {
        setExpandedItems(prev => ({
            ...prev,
            [path]: !prev[path]
        }));
    };

    const menuItems = [
        {
            title: 'sidebar.dashboard',
            icon: <Home />,
            path: '/dashboard',
            children: [
                { title: 'sidebar.users', path: '/dashboard/users' },
                { title: 'sidebar.rolesAndPermissions', path: '/dashboard/rolesAndPermissions' },
                { title: 'sidebar.coupons', path: '/dashboard/coupons' },
                { title: 'sidebar.generalConfig', path: '/dashboard/general-config' },
            ]
        },
        {
            title: 'sidebar.poolUSDT',
            icon: <Database className="text-blue-500" />,
            path: '/poolUSDT',
            children: []
        },
        {
            title: 'sidebar.poolOMDB',
            icon: <Database className="text-green-500" />,
            path: '/poolOMDB',
            children: []
        },
        {
            title: 'sidebar.omd3',
            icon: <Database className="text-purple-500" />,
            path: '/omd3',
            children: []
        },
        {
            title: 'sidebar.omdWallet',
            icon: <Wallet className="text-orange-500" />,
            path: '/omdWallet',
            children: []
        },
        {
            title: 'sidebar.promotions',
            icon: <Gift />,
            path: '/promotions',
            children: []
        },
        {
            title: 'sidebar.elementMiners',
            icon: <Layers className="text-magenta-500" />,
            path: '/elementMiners',
            children: []
        },
        {
            title: 'sidebar.emailMarketing',
            icon: <Mail />,
            path: '/emailMarketing',
            children: []
        },
        {
            title: 'sidebar.support',
            icon: <Headset />,
            path: '/support',
            children: []
        }
    ];

    const renderIcon = (itemPath: string) => {
        switch (itemPath) {
            case '/poolUSDT': return <Database color="blue" />;
            case '/poolOMDB': return <Database color="green" />;
            case '/omd3': return <Database color="purple" />;
            case '/omdWallet': return <Wallet color="orange" />;
            case '/elementMiners': return <Layers color="magenta" />;
            case '/dashboard': return <Home />;
            case '/promotions': return <Gift />;
            case '/emailMarketing': return <Mail />;
            case '/support': return <Headset />;
            default: return <Home />;
        }
    };


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
                className={`
                    /* Common Styles */
                    bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col z-50
                    
                    /* Mobile: Overlay behavior */
                    fixed inset-y-0 left-0 w-64 md:relative 
                    ${isOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 md:w-0 md:border-none md:overflow-hidden"}
                `}
            >

                <div className="flex items-center justify-between p-6 md:p-2 mb-0 border-b border-border shrink-0">
                    <span className="font-semibold text-lg">{t('common.menu')}</span>

                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 md:hidden" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <div className="flex flex-col gap-2">
                        {menuItems.map((item) => {
                            const hasChildren = item.children && item.children.length > 0;
                            const isExpanded = expandedItems[item.path];

                            return (
                                <div key={item.path} className="flex flex-col gap-1">
                                    {hasChildren ? (
                                        <Button
                                            variant="ghost"
                                            className={`w-full justify-between hover:bg-muted ${isExpanded ? 'bg-muted' : ''}`}

                                        >
                                            <div className="flex items-center gap-2">
                                                {renderIcon(item.path)}
                                                <span>{t(item.title)}</span>
                                            </div>
                                            <ChevronDown onClick={() => toggleSubmenu(item.path)} className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </Button>
                                    ) : (
                                        <NavLink
                                            to={item.path}
                                            className={({ isActive }) => isActive ? "bg-green-500 text-white rounded-lg" : "text-foreground"}
                                        >
                                            <Button variant="ghost" className={`w-full justify-start gap-2 ${item.path === location.pathname ? 'hover:bg-green-600' : ''}`} onClick={onClose}>
                                                {renderIcon(item.path)}
                                                <span>{t(item.title)}</span>
                                            </Button>
                                        </NavLink>
                                    )}

                                    {/* Submenu */}
                                    {hasChildren && isExpanded && (
                                        <div className="flex flex-col gap-1 ml-4 border-l border-border pl-2 animate-in slide-in-from-top-2 duration-200">
                                            {item.children.map((child) => (
                                                <NavLink
                                                    key={child.path}
                                                    to={child.path}
                                                    className={({ isActive }) =>
                                                        `block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted ${isActive ? "bg-green-500/10 text-green-600 font-medium" : "text-muted-foreground"}`
                                                    }
                                                    onClick={onClose}
                                                >
                                                    {t(child.title)}
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* User Info Section */}
                    <div className="mt-6 flex flex-col gap-4 pt-4 border-t border-border md:hidden bg-card">
                        <div className="p-4 rounded-lg bg-muted/50">
                            <p className="font-medium">{user?.name}</p>
                            <p className="text-xs text-muted-foreground break-all">{user?.email}</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t('home.settings')}
                            </label>
                            <div className="flex justify-between items-center px-2">
                                <span className="text-sm">{t('common.language')}</span>
                                <LanguageSelectorDropdown />
                            </div>
                        </div>

                        <div className="pt-2">
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

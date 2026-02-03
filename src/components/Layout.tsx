import { useEffect, useState } from "react";
import { Header } from "./ui/Header";
import { Sidebar } from "./ui/Sidebar";
import { useLocation } from "react-router-dom";

export const Layout = ({ children }: { children: React.ReactNode }) => {
    // Open by default on desktop
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    // On mobile, close sidebar when navigating. 
    // On desktop, we usually want it to stay open.
    useEffect(() => {
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen bg-muted/30 dark:bg-background">
            {/* Sidebar Component */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content Area (Header + Main) */}
            <div className="flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out">
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <main
                    className={`py-2 px-6 lg:px-20 grid gap-6 md:grid-cols-3 transition-all duration-300 ease-in-out`}
                >
                    {children}
                </main>
            </div>
        </div>
    );
};
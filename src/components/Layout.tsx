import { useEffect, useState } from "react";
import { Header } from "./ui/Header"
import { Sidebar } from "./ui/Sidebar"
import { useLocation } from "react-router-dom";
export const Layout = ({ children }: { children: React.ReactNode }) => {

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);
    return (
        <div className="min-h-screen bg-muted/30 dark:bg-background">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <Sidebar isOpen={sidebarOpen} onClose={() => { setSidebarOpen(false) }} />
            <main
                className={`p-6 grid gap-6 md:grid-cols-3 transition-all duration-300 ease-in-out ${sidebarOpen ? "md:ml-64" : ""
                    }`}
            >
                {children}
            </main>
        </div>
    )
}
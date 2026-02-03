import { cn } from "@/lib/utils"

export const Tabs = ({ tabs, activeTab, setActiveTab }: { tabs: string[], activeTab: string, setActiveTab: (tab: string) => void }) => {
    return (
        <div className="flex gap-2 bg-secondary p-2 rounded-md my-4 justify-around overflow-x-scroll lg:overflow-x-hidden">
            {tabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-4 py-2 rounded-md cursor-pointer", activeTab === tab ? "bg-primary text-primary-foreground" : "bg-transparent text-secondary-foreground")}>
                    {tab}
                </button>
            ))}
        </div>
    )
}
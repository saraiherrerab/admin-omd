import { EllipsisVertical } from "lucide-react"
import { Button } from "./Button"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface ButtonGroupProps {
    children: React.ReactNode;
}

export const ButtonGroup = ({ children }: ButtonGroupProps) => {
    const [open, setOpen] = useState(false)

    const handleClick = () => {
        setOpen(!open)
    }

    return (
        <div className="relative inline-flex">
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={handleClick}>
                <EllipsisVertical className="h-4 w-4" />
            </Button>
            {open && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                />
            )}
            <div
                className={cn(
                    "absolute right-0 top-full mt-1 z-50 min-w-[8rem] flex-col rounded-md border bg-white p-1 shadow-lg",
                    open ? "flex" : "hidden"
                )}
            >
                <div className="flex flex-col gap-1 w-full [&>button]:w-full [&>button]:justify-start [&>button]:h-auto [&>button]:px-2 [&>button]:py-1.5 [&>button]:font-normal" onClick={() => setOpen(false)}>
                    {children}
                </div>
            </div>
        </div>
    )
}
import { type ComponentProps, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface SelectProps extends ComponentProps<"select"> {
    options: { value: string; label: string }[]
    label: string
}
const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, options, label, ...props }, ref) => {
        return (


            <div className={cn("w-fit", className)}>
                <div className="relative group">
                    <select
                        ref={ref}
                        className={cn(
                            "peer w-full bg-background text-foreground text-sm border border-input rounded-md px-3.5 py-2.5 transition-all duration-300 ease-in-out focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-muted-foreground/30 shadow-sm disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
                            className
                        )}
                        {...props}
                        value={props.value}
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <label
                        htmlFor={props.id}
                        className="absolute cursor-text bg-background px-1 left-2.5 top-2.5 text-muted-foreground text-sm transition-all duration-300 ease-in-out transform origin-left pointer-events-none
              peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-primary peer-focus:font-medium
              peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs"
                    >
                        {label}
                    </label>
                </div>
            </div>
        )
    }
)
Select.displayName = "Select"

export { Select }

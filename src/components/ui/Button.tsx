import { type ComponentProps, forwardRef } from "react"
import { cn } from "@/lib/utils"

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "orange" | "orange-outline" | "destructive"
type ButtonSize = "sm" | "md" | "lg"

const Button = forwardRef<HTMLButtonElement, ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90 shadow": variant === "primary" || variant === "orange",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
            "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
            "border-2 border-primary text-primary bg-background hover:bg-primary/5": variant === "orange-outline",
            "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow": variant === "destructive",
            "h-8 px-3 text-xs": size === "sm",
            "h-9 px-4 py-2": size === "md",
            "h-11 px-6": size === "lg",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

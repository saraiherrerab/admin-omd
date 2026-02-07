import { type ComponentProps, forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "./Button"
import { Eye, EyeOff } from "lucide-react"

interface InputProps extends ComponentProps<"input"> {
  showPassword: boolean;
  setShowPassword: (showPassword: boolean) => void;
}

const InputPassword = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, placeholder, showPassword, setShowPassword, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative group">
          <input
            type={type}
            className={cn(
              "peer w-full bg-background text-foreground text-sm border border-input rounded-md px-3.5 py-2.5 transition-all duration-300 ease-in-out focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-muted-foreground/30 shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            placeholder=" "
            ref={ref}
            {...props}
          />

          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowPassword!(!showPassword!)}
            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>

          <label
            htmlFor={props.id}
            className="absolute cursor-text bg-background px-1 left-2.5 top-2.5 text-muted-foreground text-sm transition-all duration-300 ease-in-out transform origin-left pointer-events-none
              peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-primary peer-focus:font-medium
              peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs"
          >
            {placeholder}
          </label>
        </div>
      </div>
    )
  }
)
InputPassword.displayName = "InputPassword"

export { InputPassword }

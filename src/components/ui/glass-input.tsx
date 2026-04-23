import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  glowOnFocus?: boolean
}

const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, type, glowOnFocus = true, ...props }, ref) => {
    return (
      <div className="relative group">
        {glowOnFocus ? <div className="absolute inset-0 rounded-xl" aria-hidden="true" /> : null}
        <input
          type={type}
          className={cn(
            "relative flex h-10 w-full rounded-xl px-4 py-2 text-sm",
            "border border-white/12 bg-[#0e0f11] text-white placeholder:text-white/40",
            "transition-all duration-300",
            "focus:outline-none focus:border-white/28 focus:bg-[#0e0f11]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white",
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  },
)
GlassInput.displayName = "GlassInput"

export { GlassInput }

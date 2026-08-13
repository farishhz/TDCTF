import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium caret-transparent transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "relative bg-gradient-to-b from-blue-400/70 to-blue-600/70 text-white border border-white/20 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(37,99,235,0.25),inset_0_1px_1px_rgba(255,255,255,0.5)] hover:from-blue-400/90 hover:to-blue-600/90 hover:shadow-[0_8px_32px_0_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:from-blue-500/40 dark:to-blue-700/40 dark:border-white/10 dark:shadow-[0_8px_32px_0_rgba(37,99,235,0.15),inset_0_1px_1px_rgba(255,255,255,0.2)] dark:hover:from-blue-500/60 dark:hover:to-blue-700/60",
        destructive:
          "relative bg-gradient-to-b from-red-400/70 to-red-600/70 text-white border border-white/20 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(239,68,68,0.25),inset_0_1px_1px_rgba(255,255,255,0.5)] hover:from-red-400/90 hover:to-red-600/90 hover:shadow-[0_8px_32px_0_rgba(239,68,68,0.4),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:from-red-500/40 dark:to-red-700/40 dark:border-white/10 dark:shadow-[0_8px_32px_0_rgba(239,68,68,0.15),inset_0_1px_1px_rgba(255,255,255,0.2)] dark:hover:from-red-500/60 dark:hover:to-red-700/60",
        outline:
          "relative bg-gradient-to-b from-white/40 to-white/10 text-gray-800 border border-white/40 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.6)] hover:from-white/60 hover:to-white/20 hover:text-blue-600 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.8)] dark:from-white/10 dark:to-white/5 dark:text-gray-200 dark:border-white/10 dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.1)] dark:hover:from-white/20 dark:hover:to-white/10 dark:hover:text-blue-300 dark:hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]",
        secondary:
          "relative bg-gradient-to-b from-gray-200/50 to-gray-300/50 text-gray-800 border border-white/30 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.5)] hover:from-gray-200/70 hover:to-gray-300/70 hover:text-blue-700 dark:from-gray-700/40 dark:to-gray-800/40 dark:text-gray-100 dark:border-white/10 dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.1)] dark:hover:from-gray-700/60 dark:hover:to-gray-800/60 dark:hover:text-blue-300",
        ghost: 
          "text-gray-700 border border-transparent hover:bg-white/20 hover:backdrop-blur-lg hover:border-white/30 hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:text-blue-600 dark:text-gray-200 dark:hover:bg-white/5 dark:hover:border-white/10 dark:hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)] dark:hover:text-blue-300",
        link: 
          "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400",
      },
      size: {
        default: "h-9 px-5 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-11 px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

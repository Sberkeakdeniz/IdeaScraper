import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow hover:shadow-glow-lg hover:scale-105 active:scale-95 btn-futuristic",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-glow hover:shadow-glow-lg hover:scale-105 active:scale-95",
        outline:
          "border border-white/20 bg-transparent backdrop-blur-xl glass hover:bg-white/5 hover:border-white/30 hover:shadow-glow transition-all duration-300",
        secondary:
          "bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:from-slate-600 hover:to-slate-700 shadow-inner",
        ghost: "hover:bg-white/10 hover:backdrop-blur-xl transition-all duration-300",
        link: "text-primary underline-offset-4 hover:underline",
        neon: "bg-transparent border-2 border-indigo-400 text-indigo-400 hover:bg-indigo-400 hover:text-black hover:shadow-neon transition-all duration-300",
        gradient: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-glow hover:shadow-glow-xl hover:scale-105 active:scale-95 animate-shimmer bg-[length:200%_100%]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-14 rounded-xl px-8 text-base font-semibold",
        xl: "h-16 rounded-2xl px-12 text-lg font-bold",
        icon: "h-10 w-10",
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
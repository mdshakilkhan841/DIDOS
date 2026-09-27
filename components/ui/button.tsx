import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dudos-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.99]",
  {
    variants: {
      variant: {
        primary:
          "bg-dudos-primary text-white shadow-sm hover:bg-dudos-primary-hover",
        secondary:
          "bg-white text-dudos-text border border-dudos-border shadow-sm hover:bg-dudos-surface-alt",
        outline:
          "border border-dudos-primary/30 text-dudos-primary bg-transparent hover:bg-dudos-primary-soft",
        ghost:
          "text-dudos-text-secondary hover:text-dudos-text hover:bg-dudos-surface",
        dark:
          "bg-dudos-navy-900 text-white hover:bg-dudos-navy-800 shadow-sm",
        destructive:
          "bg-dudos-error text-white hover:bg-red-700 shadow-sm",
        link:
          "text-dudos-primary underline-offset-4 hover:underline p-0 h-auto font-normal",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md gap-1.5",
        md: "h-10 px-4 py-2 gap-2",
        lg: "h-12 px-6 text-base rounded-xl gap-2.5",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

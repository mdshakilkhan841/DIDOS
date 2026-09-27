import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-dudos-surface-mint text-dudos-primary border border-dudos-primary/20",
        primary:
          "bg-dudos-primary text-white",
        secondary:
          "bg-dudos-surface text-dudos-text-secondary border border-dudos-border",
        dark:
          "bg-dudos-navy-900 text-white",
        success:
          "bg-dudos-success-soft text-dudos-success border border-dudos-success/20",
        warning:
          "bg-dudos-warning-soft text-dudos-warning border border-dudos-warning/30",
        error:
          "bg-dudos-error-soft text-dudos-error border border-dudos-error/20",
        info:
          "bg-dudos-info-soft text-dudos-info border border-dudos-info/20",
        outline:
          "text-dudos-text border border-dudos-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

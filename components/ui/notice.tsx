import * as React from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NoticeProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "info" | "success" | "warning" | "error";
  title?: string;
}

export function Notice({
  tone = "info",
  title,
  children,
  className,
  ...props
}: NoticeProps) {
  const toneConfig = {
    info: {
      container: "bg-dudos-info-soft border-dudos-info/30 text-dudos-text",
      icon: <Info className="h-4 w-4 text-dudos-info flex-shrink-0 mt-0.5" />,
    },
    success: {
      container: "bg-dudos-success-soft border-dudos-success/30 text-dudos-text",
      icon: <CheckCircle2 className="h-4 w-4 text-dudos-success flex-shrink-0 mt-0.5" />,
    },
    warning: {
      container: "bg-dudos-warning-soft border-dudos-warning/30 text-dudos-text",
      icon: <AlertTriangle className="h-4 w-4 text-dudos-warning flex-shrink-0 mt-0.5" />,
    },
    error: {
      container: "bg-dudos-error-soft border-dudos-error/30 text-dudos-error",
      icon: <AlertCircle className="h-4 w-4 text-dudos-error flex-shrink-0 mt-0.5" />,
    },
  };

  const { container, icon } = toneConfig[tone];

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-lg border p-3.5 text-sm leading-normal animate-in fade-in-50",
        container,
        className
      )}
      {...props}
    >
      {icon}
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-1 text-sm">{title}</h5>}
        <div className="text-xs leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

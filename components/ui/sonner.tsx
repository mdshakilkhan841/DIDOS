"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-dudos-text group-[.toaster]:border-dudos-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl font-sans",
          description: "group-[.toast]:text-dudos-text-secondary text-xs",
          actionButton:
            "group-[.toast]:bg-dudos-primary group-[.toast]:text-white font-medium rounded-lg px-3 py-1.5 text-xs hover:bg-dudos-primary-hover",
          cancelButton:
            "group-[.toast]:bg-dudos-surface group-[.toast]:text-dudos-text rounded-lg px-3 py-1.5 text-xs",
          success:
            "group-[.toaster]:border-dudos-primary/40 group-[.toaster]:bg-dudos-surface-mint/80",
          error:
            "group-[.toaster]:border-dudos-error/40 group-[.toaster]:bg-dudos-error-soft",
          warning:
            "group-[.toaster]:border-dudos-warning/40 group-[.toaster]:bg-dudos-warning-soft",
          info:
            "group-[.toaster]:border-dudos-info/40 group-[.toaster]:bg-dudos-info-soft",
        },
      }}
      richColors
      closeButton
      position="top-right"
      {...props}
    />
  );
}

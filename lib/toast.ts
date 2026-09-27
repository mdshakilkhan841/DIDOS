import { toast as sonnerToast } from "sonner";
import React from "react";

export interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: React.ReactNode;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  };
  cancel?: {
    label: React.ReactNode;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  };
}

export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
      cancel: options?.cancel,
      className: "border-dudos-primary/30 text-dudos-text font-sans",
    });
  },

  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      action: options?.action,
      cancel: options?.cancel,
      className: "border-dudos-error/30 text-dudos-error font-sans",
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration || 4500,
      action: options?.action,
      cancel: options?.cancel,
      className: "border-dudos-warning/30 text-dudos-text font-sans",
    });
  },

  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
      cancel: options?.cancel,
      className: "border-dudos-info/30 text-dudos-text font-sans",
    });
  },

  promise: <T>(
    promise: Promise<T>,
    data: {
      loading: string;
      success: (data: T) => string;
      error: (err: any) => string;
    }
  ) => {
    return sonnerToast.promise(promise, data);
  },

  dismiss: (id?: string | number) => {
    sonnerToast.dismiss(id);
  },
};

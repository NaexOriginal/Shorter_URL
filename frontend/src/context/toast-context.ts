import { createContext } from "react";

export interface Toast {
  id: number;
  message: string;
}

export interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string) => void;
  dismissToast: (id: number) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

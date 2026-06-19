import { create } from "zustand";

export interface Toast {
  id: string;
  message: string;
  tone: "info" | "alert";
}

interface ToastsState {
  toasts: Toast[];
  push: (message: string, tone?: Toast["tone"]) => void;
  dismiss: (id: string) => void;
}

export const useToasts = create<ToastsState>((set) => ({
  toasts: [],
  push: (message, tone = "info") =>
    set((s) => ({
      toasts: [
        ...s.toasts,
        { id: `${Date.now().toString(36)}-${s.toasts.length}`, message, tone },
      ],
    })),
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

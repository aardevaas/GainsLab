"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, AlertCircle, Info, X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: number;
  variant: ToastVariant;
  message: string;
};

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4000;

const VARIANT_CONFIG: Record<
  ToastVariant,
  { icon: typeof Check; color: string; bg: string; border: string }
> = {
  success: {
    icon: Check,
    color: "var(--color-accent)",
    bg: "rgba(74,222,128,0.10)",
    border: "rgba(74,222,128,0.30)",
  },
  error: {
    icon: AlertCircle,
    color: "var(--color-danger)",
    bg: "rgba(248,113,113,0.10)",
    border: "rgba(248,113,113,0.30)",
  },
  info: {
    icon: Info,
    color: "var(--color-info)",
    bg: "rgba(96,165,250,0.10)",
    border: "rgba(96,165,250,0.30)",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (variant: ToastVariant, message: string) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, variant, message }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (m) => push("success", m),
      error: (m) => push("error", m),
      info: (m) => push("info", m),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  // Render nothing on the server AND the first client render so the two match;
  // mount the portal only after hydration to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed z-[100] bottom-4 right-4 flex flex-col gap-2 w-[min(360px,calc(100vw-2rem))] pointer-events-none"
      aria-live="polite"
      role="status"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const cfg = VARIANT_CONFIG[toast.variant];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg backdrop-blur-sm"
              style={{
                background: "var(--color-surface-elevated)",
                border: `1px solid ${cfg.border}`,
              }}
            >
              <span
                className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full"
                style={{ background: cfg.bg, color: cfg.color }}
              >
                <Icon size={13} />
              </span>
              <p
                className="flex-1 text-sm leading-snug"
                style={{ color: "var(--color-text)" }}
              >
                {toast.message}
              </p>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 rounded p-0.5 transition-colors hover:bg-[var(--color-surface)]"
                aria-label="Dismiss notification"
              >
                <X size={14} style={{ color: "var(--color-text-muted)" }} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body,
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

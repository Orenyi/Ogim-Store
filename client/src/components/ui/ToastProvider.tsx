import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiInfo,
  FiX,
} from "react-icons/fi";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

interface ToastContextValue {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles: Record<
  ToastType,
  {
    icon: typeof FiCheckCircle;
    iconClass: string;
    borderClass: string;
  }
> = {
  success: {
    icon: FiCheckCircle,
    iconClass: "text-[var(--color-success)]",
    borderClass: "border-l-[var(--color-success)]",
  },
  error: {
    icon: FiXCircle,
    iconClass: "text-[var(--color-error)]",
    borderClass: "border-l-[var(--color-error)]",
  },
  warning: {
    icon: FiAlertTriangle,
    iconClass: "text-[var(--color-warning)]",
    borderClass: "border-l-[var(--color-warning)]",
  },
  info: {
    icon: FiInfo,
    iconClass: "text-[var(--color-accent)]",
    borderClass: "border-l-[var(--color-accent)]",
  },
};

const DEFAULT_DURATION = 4000;
const MAX_TOASTS = 4;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());
  const idCounterRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);

    if (timer !== undefined) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, duration = DEFAULT_DURATION) => {
      if (!message.trim()) return;

      const id = `ogim-toast-${++idCounterRef.current}`;

      setToasts((current) => {
        const next = [...current, { id, type, message, duration }];

        return next.slice(-MAX_TOASTS);
      });

      if (duration > 0) {
        const timer = window.setTimeout(() => {
          dismiss(id);
        }, duration);

        timersRef.current.set(id, timer);
      }
    },
    [dismiss],
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const value: ToastContextValue = {
    success: (message, duration) => showToast("success", message, duration),
    error: (message, duration) => showToast("error", message, duration),
    warning: (message, duration) => showToast("warning", message, duration),
    info: (message, duration) => showToast("info", message, duration),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {typeof document !== "undefined" &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 top-4 z-[var(--z-toast)] flex flex-col items-center gap-3 px-4 sm:left-auto sm:right-5 sm:top-5 sm:w-full sm:max-w-sm sm:items-stretch sm:px-0">
            {toasts.map((item) => {
              const style = toastStyles[item.type];
              const Icon = style.icon;

              return (
                <div
                  key={item.id}
                  role={item.type === "error" ? "alert" : "status"}
                  aria-live={item.type === "error" ? "assertive" : "polite"}
                  aria-atomic="true"
                  className={`pointer-events-auto flex w-full items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] border-l-4 ${style.borderClass} bg-[var(--color-surface)] p-4 shadow-[var(--shadow-dropdown)]`}
                >
                  <Icon
                    size={20}
                    aria-hidden="true"
                    className={`mt-0.5 shrink-0 ${style.iconClass}`}
                  />

                  <p className="min-w-0 flex-1 break-words text-sm font-medium leading-5 text-[var(--color-ink)]">
                    {item.message}
                  </p>

                  <button
                    type="button"
                    onClick={() => dismiss(item.id)}
                    aria-label="Dismiss notification"
                    className="-mr-1 -mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]"
                  >
                    <FiX size={16} aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}

import clsx from 'clsx';
import React from 'react';
import { createPortal } from 'react-dom';
import {
  CircleCheckIcon,
  CircleInfoIcon,
  CircleXIcon,
  CloseIcon,
  TriangleAlertIcon
} from '../Icons';
import styles from './toast.module.css';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export type ToastPlacement =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left';

export type ToastAction = {
  label: string;
  onClick: () => void;
};

export type ToastOptions = {
  id?: string;
  title?: string;
  description: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
};

export type ToastProviderProps = {
  children: React.ReactNode;
  placement?: ToastPlacement;
  limit?: number;
  className?: string;
  style?: React.CSSProperties;
};

type ToastRecord = Required<Pick<ToastOptions, 'description'>> &
  Omit<ToastOptions, 'description'> & {
    id: string;
    variant: ToastVariant;
    duration: number;
  };

type ToastContextValue = {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

const VariantIconMap: Record<ToastVariant, React.ReactNode> = {
  info: <CircleInfoIcon size='lg' className={styles.toast_icon_svg} />,
  success: <CircleCheckIcon size='lg' className={styles.toast_icon_svg} />,
  warning: <TriangleAlertIcon size='lg' className={styles.toast_icon_svg} />,
  error: <CircleXIcon size='lg' className={styles.toast_icon_svg} />
};

const PlacementClassMap: Record<ToastPlacement, string> = {
  'top-right': styles.toast_viewport_top_right,
  'top-left': styles.toast_viewport_top_left,
  'bottom-right': styles.toast_viewport_bottom_right,
  'bottom-left': styles.toast_viewport_bottom_left
};

function generateToastId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return `toast-${Math.random().toString(36).slice(2, 11)}`;
}

export function ToastProvider({
  children,
  placement = 'top-right',
  limit = 4,
  className,
  style
}: Readonly<ToastProviderProps>) {
  const [toasts, setToasts] = React.useState<ReadonlyArray<ToastRecord>>([]);
  const timersRef = React.useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {}
  );

  const clearTimer = React.useCallback((id: string) => {
    const timer = timersRef.current[id];

    if (!timer) {
      return;
    }

    clearTimeout(timer);
    delete timersRef.current[id];
  }, []);

  const dismiss = React.useCallback(
    (id: string) => {
      clearTimer(id);
      setToasts((currentToasts) =>
        currentToasts.filter((toast) => toast.id !== id)
      );
    },
    [clearTimer]
  );

  const dismissAll = React.useCallback(() => {
    Object.keys(timersRef.current).forEach((id) => {
      clearTimer(id);
    });

    setToasts([]);
  }, [clearTimer]);

  const toast = React.useCallback(
    (options: ToastOptions) => {
      const id = options.id ?? generateToastId();
      const duration =
        typeof options.duration === 'number' ? options.duration : 4000;
      const nextToast: ToastRecord = {
        id,
        title: options.title,
        description: options.description,
        variant: options.variant ?? 'info',
        duration,
        action: options.action
      };

      setToasts((currentToasts) => {
        const safeLimit = Math.max(limit, 1);
        const nextToasts = [nextToast, ...currentToasts];

        if (nextToasts.length <= safeLimit) {
          return nextToasts;
        }

        const removed = nextToasts.slice(safeLimit);
        for (const removedToast of removed) {
          clearTimer(removedToast.id);
        }

        return nextToasts.slice(0, safeLimit);
      });

      if (duration > 0) {
        clearTimer(id);

        timersRef.current[id] = setTimeout(() => {
          dismiss(id);
        }, duration);
      }

      return id;
    },
    [clearTimer, dismiss, limit]
  );

  React.useEffect(() => {
    return () => {
      Object.keys(timersRef.current).forEach((id) => {
        clearTimer(id);
      });
    };
  }, [clearTimer]);

  const contextValue = React.useMemo(
    () => ({ toast, dismiss, dismissAll }),
    [dismiss, dismissAll, toast]
  );

  const viewport = (
    <section
      className={clsx(
        styles.toast_viewport,
        PlacementClassMap[placement],
        className
      )}
      style={style}
      aria-label='Notifications'
    >
      <ol className={styles.toast_list}>
        {toasts.map((toastItem) => (
          <li key={toastItem.id} className={styles.toast_list_item}>
            <output
              className={clsx(
                styles.toast,
                styles[`toast_${toastItem.variant}`]
              )}
              aria-live={toastItem.variant === 'error' ? 'assertive' : 'polite'}
              aria-atomic='true'
            >
              <span className={styles.toast_icon}>
                {VariantIconMap[toastItem.variant]}
              </span>

              <div className={styles.toast_body}>
                {toastItem.title && (
                  <strong className={styles.toast_title}>
                    {toastItem.title}
                  </strong>
                )}
                <p className={styles.toast_description}>
                  {toastItem.description}
                </p>
              </div>

              {toastItem.action && (
                <button
                  type='button'
                  className={styles.toast_action}
                  onClick={() => {
                    toastItem.action?.onClick();
                    dismiss(toastItem.id);
                  }}
                >
                  {toastItem.action.label}
                </button>
              )}

              <button
                type='button'
                className={styles.toast_close}
                onClick={() => dismiss(toastItem.id)}
                aria-label='Dismiss notification'
              >
                <CloseIcon size='sm' />
              </button>
            </output>
          </li>
        ))}
      </ol>
    </section>
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {typeof document === 'undefined'
        ? viewport
        : createPortal(viewport, document.body)}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const contextValue = React.useContext(ToastContext);

  if (!contextValue) {
    throw new Error('useToast must be used within a ToastProvider.');
  }

  return contextValue;
}

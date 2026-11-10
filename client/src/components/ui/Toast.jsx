import { createContext, useCallback, useContext, useState } from 'react';
import { cx } from '../../utils/cx';

// Toast - a self-contained notification system (context + provider +
// hook + visual stack), scoped entirely to UI plumbing: showing and
// dismissing brief messages. It holds no business logic and makes no
// decisions about *when* to fire - pages/features call useToast().show(...)
// with whatever message they already have.
//
// This is deliberately its own small context, separate from
// AppProviders' future session/assessment state (Phase 2 §5) - toast
// visibility is ephemeral UI state, not app/session state.

const ToastContext = createContext(null);

// Phase 1 defines no status/error color, so every tone reads through
// navy/gray + an icon, not color - consistent with Button/Input/etc.
const TONE_STYLES = {
  info: { icon: 'ℹ', classes: 'bg-navy text-white' },
  success: { icon: '✓', classes: 'bg-navy text-white' },
  error: { icon: '!', classes: 'bg-navy text-white' },
};

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message, { tone = 'info', duration = 4000 } = {}) => {
      const id = ++idCounter;
      setToasts((current) => [...current, { id, message, tone }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3 w-full max-w-sm"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cx(
              'flex items-start gap-3 rounded-lg shadow-3 px-4 py-3 text-body',
              'animate-toast-in motion-reduce:animate-none',
              TONE_STYLES[toast.tone]?.classes
            )}
          >
            <span className="font-mono text-small mt-0.5" aria-hidden="true">
              {TONE_STYLES[toast.tone]?.icon}
            </span>
            <p className="flex-1">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="text-white/70 hover:text-white transition-colors duration-150"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast() must be used within a <ToastProvider>.');
  }
  return context;
}

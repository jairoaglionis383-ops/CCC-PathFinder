import { useEffect, useRef } from 'react';
import { cx } from '../../utils/cx';

// Modal - the only overlay/dialog pattern in the app. Handles the
// mechanics any modal needs (focus trap entry, Escape to close,
// backdrop click to close, scroll lock) so pages that use it only
// ever supply content, not modal plumbing.
export default function Modal({ open, onClose, title, children, footer, className = '' }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    dialogRef.current?.focus();
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose?.();
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-navy/50 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        className={cx(
          'relative w-full max-w-lg bg-white rounded-lg shadow-3 p-6',
          'focus:outline-none',
          className
        )}
      >
        {title && (
          <h2 id="modal-title" className="text-h2 font-sans font-semibold text-navy mb-4">
            {title}
          </h2>
        )}
        <div className="text-body text-navy">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

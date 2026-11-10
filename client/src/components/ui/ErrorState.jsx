import { cx } from '../../utils/cx';

// ErrorState - "something went wrong" surface for a failed fetch/
// submission (e.g. an API call rejected by apiClient's response
// interceptor). Per the same constraint as Button/Input/Toast, Phase 1
// has no error/status color - this is distinguished from EmptyState by
// icon and tone of copy, not color, and offers an optional retry
// action supplied by the caller (this component never calls the API
// itself).
export default function ErrorState({
  title = 'Something went wrong.',
  description,
  onRetry,
  retryLabel = 'Try again',
  className = '',
}) {
  return (
    <div className={cx('flex flex-col items-center justify-center gap-3 py-16 px-6 text-center', className)}>
      <div
        className="flex h-14 w-14 items-center justify-center rounded-pill bg-navy text-white"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
          <path
            d="M12 8v5m0 3.5h.01M10.29 3.86L1.82 18a1 1 0 00.87 1.5h18.62a1 1 0 00.87-1.5L13.71 3.86a1 1 0 00-1.72 0z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="text-h3 text-navy">{title}</h3>
      {description && <p className="text-body text-gray-dark max-w-sm">{description}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-body font-medium text-sky-ink hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sky rounded-sm"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}

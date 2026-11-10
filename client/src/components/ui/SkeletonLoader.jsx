import { cx } from '../../utils/cx';

// SkeletonLoader - a shape-matching placeholder for content that's
// about to arrive (e.g. a Program Readiness section while its fetch
// is in flight). `variant` covers the shapes reused across the app;
// `lines` controls how many text bars a "text" skeleton renders.
const VARIANT_CLASSES = {
  text: 'h-4 rounded-sm',
  title: 'h-6 rounded-sm',
  card: 'h-32 rounded-lg',
  circle: 'rounded-pill aspect-square',
};

export default function SkeletonLoader({ variant = 'text', lines = 1, className = '' }) {
  if (variant === 'text' && lines > 1) {
    return (
      <div className={cx('flex flex-col gap-2', className)} aria-hidden="true">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cx(
              'bg-gray-light rounded-sm animate-pulse motion-reduce:animate-none',
              VARIANT_CLASSES.text,
              index === lines - 1 && 'w-2/3'
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cx(
        'bg-gray-light animate-pulse motion-reduce:animate-none',
        VARIANT_CLASSES[variant],
        className
      )}
    />
  );
}

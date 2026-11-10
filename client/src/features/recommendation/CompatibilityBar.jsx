import { cx } from '../../utils/cx';

// CompatibilityBar - Phase 1 §7 data-visualization rule applied
// directly: department base color as the fill, Light Gray track,
// value rendered in JetBrains Mono. Purely presentational - it
// receives a `percentage` it does not calculate (the Weighted
// Compatibility Scoring Algorithm and all ranking logic belong to
// Phase 8, not this component). The width transition is CSS-only, so
// a parent can animate a count-up by changing the `percentage` prop
// over time without this component knowing anything about that.

const FILL_CLASSES = {
  dte: 'bg-dte',
  dci: 'bg-dci',
  dba: 'bg-dba',
  das: 'bg-das',
};

const TEXT_CLASSES = {
  dte: 'text-dte-text',
  dci: 'text-dci-text',
  dba: 'text-dba-text',
  das: 'text-das-text',
};

export default function CompatibilityBar({ colorKey, percentage, label, className = '' }) {
  const clamped = Math.min(100, Math.max(0, percentage));

  return (
    <div className={cx('w-full', className)}>
      <div className="mb-1.5 flex items-center justify-between">
        {label ? <span className="text-small text-gray-dark">{label}</span> : <span />}
        <span className={cx('font-mono text-small font-medium', TEXT_CLASSES[colorKey])}>
          {Math.round(clamped)}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ? `${label} compatibility` : 'Compatibility'}
        className="h-2.5 w-full rounded-pill bg-gray-light overflow-hidden"
      >
        <div
          className={cx(
            'h-full rounded-pill transition-[width] duration-200 ease-out motion-reduce:transition-none',
            FILL_CLASSES[colorKey]
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

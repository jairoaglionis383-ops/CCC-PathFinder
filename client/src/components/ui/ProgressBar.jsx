import { cx } from '../../utils/cx';

// ProgressBar - a determinate fill bar. Its primary use is the
// assessment's "Question 12 of 20" progress (Phase 1 §5: smooth fill
// as each question is answered), but it's generic enough for any
// determinate progress need.
export default function ProgressBar({ value, max = 100, label, className = '' }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cx('w-full', className)}>
      {label && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-small text-gray-dark">{label}</span>
          <span className="font-mono text-small text-sky-ink">{Math.round(percent)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={typeof label === 'string' ? label : 'Progress'}
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2.5 w-full rounded-pill bg-sky-mist overflow-hidden"
      >
        <div
          className="h-full rounded-pill bg-progress-gradient transition-[width] duration-200 ease-out motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

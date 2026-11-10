import { cx } from '../../utils/cx';

// Badge - generic status/label pill (e.g. "In Progress", "Completed",
// admin role tags). Department identity badges are a distinct,
// higher-level component (features/recommendation/DepartmentBadge)
// built on top of this one - kept separate because a department badge
// always needs the department's accent + mascot name + crest, while
// this one is a plain neutral pill for everything else.

const TONE_CLASSES = {
  neutral: 'bg-gray-light text-navy',
  sky: 'bg-sky-mist text-sky-ink',
  navy: 'bg-navy text-white',
};

export default function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-caption font-medium uppercase tracking-wide',
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

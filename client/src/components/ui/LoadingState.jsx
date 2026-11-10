import { cx } from '../../utils/cx';

// LoadingState - the generic "content is on its way" indicator for
// ordinary async waits (a section fetching data, a button mid-submit
// context, etc). This is NOT the Processing/Analysis screen - that's
// a full dedicated page with its own compass-inspired animation
// (Phase 1 §5), built separately since it's a specific moment in the
// flow, not a reusable primitive.
export default function LoadingState({ label = 'Loading…', className = '' }) {
  return (
    <div
      role="status"
      className={cx('flex flex-col items-center justify-center gap-3 py-12 text-center', className)}
    >
      <span
        className="h-8 w-8 rounded-full border-2 border-sky border-t-transparent animate-spin motion-reduce:animate-none"
        aria-hidden="true"
      />
      <p className="text-small text-gray-dark">{label}</p>
    </div>
  );
}

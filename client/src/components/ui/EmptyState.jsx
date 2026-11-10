import { cx } from '../../utils/cx';

// EmptyState - "there's nothing here yet" (e.g. Dashboard with no
// assessment history). Accepts an optional action so the empty state
// can point the student toward the thing that would fill it, without
// this component knowing what that action actually does.
export default function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div className={cx('flex flex-col items-center justify-center gap-3 py-16 px-6 text-center', className)}>
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-pill bg-gray-light text-gray-dark" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="text-h3 text-navy">{title}</h3>
      {description && <p className="text-body text-gray-dark max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

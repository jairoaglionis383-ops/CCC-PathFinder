import { forwardRef } from 'react';
import { cx } from '../../utils/cx';

// Checkbox - native checkbox with a visible label and an optional error line,
// styled with the same tokens as Input/Select (sky focus ring, navy text).
// Never checked by default: the parent decides through the `checked` prop.
const Checkbox = forwardRef(function Checkbox(
  { label, error, id, name, className = '', ...rest },
  ref
) {
  const checkboxId = id || name;
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={checkboxId} className="flex items-start gap-3 cursor-pointer">
        <input
          ref={ref}
          id={checkboxId}
          name={name}
          type="checkbox"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${checkboxId}-error` : undefined}
          className="mt-1 h-5 w-5 shrink-0 rounded border-gray-dark/40 accent-sky-ink focus:outline-none focus:ring-2 focus:ring-sky focus:ring-offset-1"
          {...rest}
        />
        <span className="text-small text-navy">{label}</span>
      </label>
      {error && (
        <p id={`${checkboxId}-error`} className="pl-8 text-small font-medium text-navy">
          {error}
        </p>
      )}
    </div>
  );
});

export default Checkbox;

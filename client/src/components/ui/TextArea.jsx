import { forwardRef } from 'react';
import { cx } from '../../utils/cx';

// TextArea - same visual language as Input, for the rare multi-line
// field (e.g. an optional "anything else about your background" box).
const TextArea = forwardRef(function TextArea(
  { label, error, hint, id, rows = 4, className = '', containerClassName = '', ...rest },
  ref
) {
  const areaId = id || rest.name;
  const describedBy = error ? `${areaId}-error` : hint ? `${areaId}-hint` : undefined;

  return (
    <div className={cx('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={areaId} className="text-small font-medium text-navy">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={areaId}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cx(
          'w-full resize-y rounded-md border bg-white px-4 py-2.5 text-body text-navy',
          'placeholder:text-gray-dark/60',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-sky focus:border-sky',
          'disabled:bg-gray-light disabled:cursor-not-allowed',
          error ? 'border-navy' : 'border-gray-dark/30',
          className
        )}
        {...rest}
      />
      {error && (
        <p id={`${areaId}-error`} className="text-small text-navy font-medium">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${areaId}-hint`} className="text-small text-gray-dark">
          {hint}
        </p>
      )}
    </div>
  );
});

export default TextArea;

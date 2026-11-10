import { forwardRef } from 'react';
import { cx } from '../../utils/cx';

// Input - the only text input styling in the app. Used directly by
// Student Information and Admin Login forms in later milestones.
// forwardRef so react-hook-form-style or manual ref-based focus
// management works from the pages that consume it.
const Input = forwardRef(function Input(
  { label, error, hint, id, className = '', containerClassName = '', ...rest },
  ref
) {
  const inputId = id || rest.name;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={cx('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-small font-medium text-navy">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cx(
          'w-full rounded-md border bg-white px-4 py-2.5 text-body text-navy',
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
        <p id={`${inputId}-error`} className="text-small text-navy font-medium">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="text-small text-gray-dark">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;

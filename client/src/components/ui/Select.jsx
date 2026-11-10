import { forwardRef } from 'react';
import { cx } from '../../utils/cx';

// Select - native <select> styled to match Input exactly, so a form
// mixing both (e.g. Student Information: text fields + track dropdown)
// reads as one consistent control set rather than two different systems.
const Select = forwardRef(function Select(
  { label, error, hint, id, options = [], groups, placeholder, className = '', containerClassName = '', ...rest },
  ref
) {
  const selectId = id || rest.name;
  const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;

  return (
    <div className={cx('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={selectId} className="text-small font-medium text-navy">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cx(
            'w-full appearance-none rounded-md border bg-white px-4 py-2.5 pr-10 text-body text-navy',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-sky focus:border-sky',
            'disabled:bg-gray-light disabled:cursor-not-allowed',
            error ? 'border-navy' : 'border-gray-dark/30',
            className
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {/* Optional labelled groups: groups = [{ label, options: [{ value, label }] }] */}
          {groups?.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-dark"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {error && (
        <p id={`${selectId}-error`} className="text-small text-navy font-medium">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${selectId}-hint`} className="text-small text-gray-dark">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Select;

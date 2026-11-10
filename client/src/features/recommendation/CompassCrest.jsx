// CompassCrest - PLACEHOLDER ONLY, per Phase 1 §6 (the Compass Crest
// signature concept) and this milestone's explicit scope. This is a
// simple geometric shield mark in the department's color, standing in
// for the crest wherever a department needs a visual identity mark
// (DepartmentBadge, dashboard history rows). The fuller expression of
// the concept - the four-point compass orientation display that
// "rotates" toward a student's strongest match - is a Results-page
// composition built from this same mark, not a change to this file's
// shape; it's built when the Results page itself is built.

const COLOR_VAR = {
  dte: 'var(--color-dte)',
  dci: 'var(--color-dci)',
  dba: 'var(--color-dba)',
  das: 'var(--color-das)',
};

export default function CompassCrest({ colorKey, size = 20, className = '' }) {
  const fill = COLOR_VAR[colorKey] || 'var(--color-navy)';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 2L21 6V12C21 17 17 21 12 22C7 21 3 17 3 12V6L12 2Z"
        fill={fill}
      />
    </svg>
  );
}

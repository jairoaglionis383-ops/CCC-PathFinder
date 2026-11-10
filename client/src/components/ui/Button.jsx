import { cx } from '../../utils/cx';

// Button - the only button styling in the app. Every clickable action
// (student flow CTAs, admin login, forms) uses this rather than a raw
// <button> with inline classes, per the Phase 2 "shared UI primitives"
// rule.
//
// Note on `danger`: Phase 1 defines no error/status color anywhere in
// the palette (by design - department colors are identity-only, and
// the primary palette is Sky/White/Navy/Gray). A red destructive
// variant would be an invented, off-token color, so this variant
// distinguishes itself with a solid navy fill instead - destructive
// intent is carried by icon and copy ("Delete", a trash icon) at the
// call site, not by color.

const VARIANT_CLASSES = {
  primary: 'bg-sky-ink text-white shadow-1 hover:bg-sky-ink/95 hover:shadow-2 active:bg-sky-ink/90',
  secondary: 'bg-white text-navy border border-navy/20 hover:border-navy hover:bg-sky-mist',
  ghost: 'bg-transparent text-navy hover:bg-gray-light',
  danger: 'bg-navy text-white hover:bg-navy/90 active:bg-navy/80',
};

const SIZE_CLASSES = {
  sm: 'text-small px-4 py-2',
  md: 'text-body px-5 py-2.5',
  lg: 'text-h3 px-6 py-3',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  className = '',
  as: Component = 'button',
  ...rest
}) {
  // `type`/`disabled` are native <button> semantics only - passing them
  // to react-router's <Link> (or an <a>) would just leak as invalid
  // DOM attributes, so they're only applied when actually rendering a
  // <button>. This is what lets a page do
  // `<Button as={Link} to={ROUTES.studentInfo}>` and get identical
  // styling to every other button without a second, duplicated set of
  // link-specific classes anywhere.
  const isNativeButton = Component === 'button';

  return (
    <Component
      {...(isNativeButton ? { type, disabled: disabled || loading } : {})}
      onClick={onClick}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-md font-display font-semibold',
        'transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {loading && (
        <span
          className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      )}
      {children}
    </Component>
  );
}

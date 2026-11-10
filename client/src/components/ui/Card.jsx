import { cx } from '../../utils/cx';

// Card - the single card surface used everywhere (program cards,
// result cards, form panels, dashboard tiles). Per Phase 1 §7:
// white surface, shadow-1 at rest, shadow-2 on hover (opt-in via
// `hoverable`), radius-lg, department accent only ever as a left
// border strip - never a full background - enforced by the
// `accent` prop rather than left to each call site to get right.

const ACCENT_BORDER_CLASSES = {
  none: '',
  dte: 'border-l-4 border-l-dte',
  dci: 'border-l-4 border-l-dci',
  dba: 'border-l-4 border-l-dba',
  das: 'border-l-4 border-l-das',
};

export default function Card({
  children,
  accent = 'none',
  hoverable = false,
  padding = 'p-6',
  className = '',
  as: Component = 'div',
  ...rest
}) {
  return (
    <Component
      className={cx(
        'bg-white rounded-lg shadow-1 border border-navy/5',
        hoverable && 'transition-all duration-200 hover:shadow-2 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
        ACCENT_BORDER_CLASSES[accent],
        padding,
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

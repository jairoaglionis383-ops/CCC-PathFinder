import { cx } from '../../utils/cx';
import CompassCrest from './CompassCrest';

// DepartmentBadge - the identity badge for a department (e.g. "DCI —
// Silver Vikings"), per Phase 1 §2.2 and §6: department color arrives
// only as tint background + text-on-tint color + the crest, never as
// a full-saturation background. Used anywhere a department needs to
// be identified at a glance - result cards, readiness pages, dashboard
// history.
//
// This component owns no data of its own - the department object is
// passed in fully formed (code, name, mascotName, colorKey). It does
// not fetch or know how departments are looked up; that's a services/
// concern in a later milestone.

const TINT_CLASSES = {
  dte: 'bg-dte-tint text-dte-text',
  dci: 'bg-dci-tint text-dci-text',
  dba: 'bg-dba-tint text-dba-text',
  das: 'bg-das-tint text-das-text',
};

export default function DepartmentBadge({ department, size = 'md', className = '' }) {
  const { code, mascotName, colorKey } = department;

  return (
    <span
      className={cx(
        'inline-flex items-center gap-2 rounded-pill font-medium',
        size === 'sm' ? 'px-2.5 py-1 text-caption' : 'px-3.5 py-1.5 text-small',
        TINT_CLASSES[colorKey],
        className
      )}
    >
      <CompassCrest colorKey={colorKey} size={size === 'sm' ? 14 : 18} />
      {code} — {mascotName}
    </span>
  );
}

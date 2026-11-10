import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import DepartmentBadge from './DepartmentBadge';
import CompatibilityBar from './CompatibilityBar';

// ResultCard - a single department's entry in the ranked Results list.
// Composed entirely from already-built primitives (Card, Badge,
// DepartmentBadge, CompatibilityBar) rather than its own styling, per
// the "no duplicated UI" rule. It receives a fully-formed `result`
// object and renders it - no scoring, no ranking, no tie-breaking
// logic lives here (Phase 8 owns all of that; the approved Phase 3
// data model already allows two results to share a `rank`, and this
// component just displays whatever rank it's given, ties included).
export default function ResultCard({ result, className = '' }) {
  const { department, percentage, rank } = result;

  return (
    <Card accent={department.colorKey} hoverable className={className}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <Badge tone="neutral" className="mb-2">
            Rank {rank}
          </Badge>
          <h3 className="text-h3 text-navy">{department.name}</h3>
        </div>
      </div>

      <DepartmentBadge department={department} className="mb-5" />

      <CompatibilityBar
        colorKey={department.colorKey}
        percentage={percentage}
        label="Compatibility"
      />
    </Card>
  );
}

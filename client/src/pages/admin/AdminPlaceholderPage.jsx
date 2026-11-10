import EmptyState from '../../components/ui/EmptyState';

// AdminPlaceholderPage - rendered at the admin root while there is no
// real admin management UI to show yet (that's Phase 10, matching the
// backend's own /api/v1/admin/* endpoints, which currently respond
// 501 for the same reason). Communicates scope honestly rather than
// simulating a dashboard that doesn't exist.
export default function AdminPlaceholderPage() {
  return (
    <EmptyState
      title="Admin management is not available yet"
      description="Program, question, weight, and report management are built in a later phase."
    />
  );
}

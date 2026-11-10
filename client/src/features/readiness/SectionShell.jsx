import Card from '../../components/ui/Card';

// Shared heading + card wrapper for every learning section.
export default function SectionShell({ id, title, subtitle, colorKey, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <Card padding="p-6" accent={colorKey}>
        <h2 className="font-display text-h3 font-bold text-navy">{title}</h2>
        {subtitle && <p className="mt-1 mb-4 text-small text-gray-dark">{subtitle}</p>}
        {!subtitle && <div className="mb-4" />}
        {children}
      </Card>
    </section>
  );
}

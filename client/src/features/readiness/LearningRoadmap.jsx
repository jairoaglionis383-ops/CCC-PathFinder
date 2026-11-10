import SectionShell from './SectionShell';
import Button from '../../components/ui/Button';
import ResourceLink from './ResourceLink';

export default function LearningRoadmap({ roadmap, resources, progress, onToggleWeek, ui, lang, colorKey }) {
  const byId = Object.fromEntries(resources.map((r) => [r.id, r]));
  return (
    <SectionShell id="roadmap" title={ui.roadmapTitle} subtitle={ui.roadmapSub} colorKey={colorKey}>
      <ol className="flex flex-col gap-4">
        {roadmap.map((week, i) => {
          const done = !!progress.weeks[i];
          return (
            <li key={i} className="rounded-md border border-navy/10 p-4">
              <details className="group/week" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-sky [&::-webkit-details-marker]:hidden">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-caption uppercase tracking-wide text-sky-ink">{ui.week} {i + 1}</p>
                      {done && <span className="text-xs font-semibold text-emerald-700">✓ {ui.weekDone}</span>}
                    </div>
                    <h3 className="mt-1 font-display text-body font-bold text-navy">{week.topic[lang]}</h3>
                  </div>
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-sky-mist text-lg text-navy transition group-open/week:rotate-45" aria-hidden="true">＋</span>
                </summary>
                <div className="pt-4">
                  <ul className="list-disc space-y-2 pl-5 text-small leading-relaxed text-gray-dark marker:text-sky">
                    <li><span className="font-medium text-navy">{ui.objective}: </span>{week.objective[lang]}</li>
                    <li><span className="font-medium text-navy">{ui.practice}: </span>{week.practice[lang]}</li>
                  </ul>
                  <div className="mt-4">
                    <p className="mb-2 text-caption font-medium uppercase tracking-wide text-gray-dark">{ui.resourcesLabel}</p>
                    <ul className="flex flex-col gap-2">
                      {week.resources.map((rid) => {
                        const r = byId[rid];
                        return r ? <li key={rid}><ResourceLink resource={r} ui={ui} lang={lang} compact /></li> : null;
                      })}
                    </ul>
                  </div>
                  <Button size="sm" variant={done ? 'secondary' : 'primary'} className="mt-4" onClick={() => onToggleWeek(i)} aria-pressed={done}>
                    {done ? ui.weekDone : ui.markWeekDone}
                  </Button>
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </SectionShell>
  );
}

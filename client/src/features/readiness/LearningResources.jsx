import SectionShell from './SectionShell';
import Badge from '../../components/ui/Badge';
import ResourceLink from './ResourceLink';
import { CHANNELS, RESOURCE_STATUSES } from '../../constants/learningContent';

const STATUS_LABEL = {
  to_watch: 'statusToWatch',
  in_progress: 'statusInProgress',
  completed: 'statusCompleted',
};
const KIND_LABEL = { playlist: 'linkPlaylist', search: 'linkSearch', channel: 'linkChannel' };

export default function LearningResources({ resources, progress, onSetStatus, ui, lang, colorKey }) {
  return (
    <SectionShell id="resources" title={ui.resourcesTitle} subtitle={ui.resourcesSub} colorKey={colorKey}>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {resources.map((r) => {
          const status = progress.resources[r.id] || '';
          const selectId = `status-${r.id}`;
          const channel = CHANNELS[r.channel];

          return (
            <li
              key={r.id}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-1 transition duration-200 hover:-translate-y-1 hover:border-sky/40 hover:shadow-2"
            >
              <div className="relative flex min-h-28 items-center justify-between overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-orange-400 px-5 py-4 text-white">
                <div className="absolute -right-5 -top-8 h-28 w-28 rounded-full border-[18px] border-white/10" aria-hidden="true" />
                <div className="absolute -bottom-10 right-16 h-24 w-24 rounded-full bg-white/10" aria-hidden="true" />
                <div className="relative z-10 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">YouTube resource</p>
                  <p className="mt-1 break-words font-display text-lg font-extrabold leading-tight">{channel.name}</p>
                </div>
                <span
                  className="relative z-10 ml-3 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20 text-xl shadow-sm ring-1 ring-white/30"
                  aria-hidden="true"
                >
                  ▶
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge tone="neutral">{ui[KIND_LABEL[r.kind]]}</Badge>
                  {status === 'completed' && (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      ✓ {ui[STATUS_LABEL.completed]}
                    </span>
                  )}
                </div>

                <h3 className="font-display text-base font-bold leading-snug text-navy">
                  {r.topic[lang]}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-dark">{r.why[lang]}</p>

                <div className="mt-5 flex flex-col gap-3 border-t border-navy/10 pt-4">
                  <ResourceLink resource={r} ui={ui} lang={lang} />
                  <label htmlFor={selectId} className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-dark">
                    <span className="font-medium">{ui.status}</span>
                    <select
                      id={selectId}
                      value={status}
                      onChange={(e) => onSetStatus(r.id, e.target.value || null)}
                      className="max-w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-sm text-navy outline-none transition focus:border-sky focus:ring-2 focus:ring-sky/20"
                    >
                      <option value="">{ui.statusNone}</option>
                      {RESOURCE_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {ui[STATUS_LABEL[s]]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-caption text-gray-dark">{ui.linkNote}</p>
    </SectionShell>
  );
}

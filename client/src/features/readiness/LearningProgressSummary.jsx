import SectionShell from './SectionShell';
import ProgressBar from '../../components/ui/ProgressBar';
import { summarizeDepartment } from '../../utils/learningProgressStore';

export default function LearningProgressSummary({ progress, taskCount, ui, colorKey }) {
  const s = summarizeDepartment(progress, { taskCount });
  const rows = [
    [ui.pTasks, s.tasksDone, s.taskCount],
    [ui.pWeeks, s.weeksDone, s.weekCount],
  ];
  return (
    <SectionShell id="progress" title={ui.progressTitle} subtitle={ui.progressSub} colorKey={colorKey}>
      <div className="flex flex-col gap-4">
        {rows.map(([label, done, total]) => (
          <ProgressBar key={label} value={done} max={total} label={`${label}: ${done}/${total}`} />
        ))}
        <p className="text-small text-gray-dark">
          {ui.pResources}: <span className="font-mono text-navy">{s.resourcesCompleted}</span> · {ui.pSaved}:{' '}
          <span className="font-mono text-navy">{s.resourcesSaved}</span>
        </p>
        {s.quiz && <p className="text-small text-gray-dark">{ui.lastScore(s.quiz.score, s.quiz.total)}</p>}
      </div>
    </SectionShell>
  );
}

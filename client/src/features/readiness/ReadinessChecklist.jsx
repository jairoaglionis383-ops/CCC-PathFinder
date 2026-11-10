import SectionShell from './SectionShell';
import ProgressBar from '../../components/ui/ProgressBar';

export default function ReadinessChecklist({ checklist, progress, onToggle, ui, lang, colorKey }) {
  const done = checklist.filter((t) => progress.tasks[t.id]).length;
  return (
    <SectionShell id="checklist" title={ui.checklistTitle} colorKey={colorKey}>
      <ProgressBar value={done} max={checklist.length} label={ui.tasksCompleted(done, checklist.length)} className="mb-4" />
      <ul className="flex flex-col gap-2">
        {checklist.map((task) => {
          const checked = !!progress.tasks[task.id];
          const inputId = `task-${task.id}`;
          return (
            <li key={task.id}>
              <label
                htmlFor={inputId}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-navy/10 p-3 hover:bg-sky-mist"
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(task.id)}
                  className="mt-1 h-4 w-4 accent-sky"
                />
                <span className={`text-small ${checked ? 'text-gray-dark line-through' : 'text-navy'}`}>
                  {task.text[lang]}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}

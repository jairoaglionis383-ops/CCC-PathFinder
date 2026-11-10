import { useCallback, useState } from 'react';
import {
  readAllProgress,
  writeAllProgress,
  readDepartmentProgress,
  summarizeDepartment,
} from '../utils/learningProgressStore';
import { DEPARTMENT_CODES } from '../constants/departments';

// Per-department learning progress, persisted in this browser only.
export function useLearningProgress(code) {
  const [progress, setProgress] = useState(() => readDepartmentProgress(readAllProgress(), code));

  // Re-read from storage on every change so two tabs/pages never clobber
  // each other's other-department data.
  const update = useCallback(
    (mutate) => {
      const all = readAllProgress();
      const next = mutate(readDepartmentProgress(all, code));
      writeAllProgress({ ...all, v: 1, [code]: next });
      setProgress(next);
    },
    [code]
  );

  const setResourceStatus = useCallback(
    (id, status) =>
      update((p) => {
        const resources = { ...p.resources };
        if (status) resources[id] = status;
        else delete resources[id];
        return { ...p, resources };
      }),
    [update]
  );

  const toggleWeek = useCallback(
    (index) =>
      update((p) => {
        const weeks = { ...p.weeks };
        if (weeks[index]) delete weeks[index];
        else weeks[index] = true;
        return { ...p, weeks };
      }),
    [update]
  );

  const toggleTask = useCallback(
    (id) =>
      update((p) => {
        const tasks = { ...p.tasks };
        if (tasks[id]) delete tasks[id];
        else tasks[id] = true;
        return { ...p, tasks };
      }),
    [update]
  );

  const saveQuizResult = useCallback(
    (score, total) => update((p) => ({ ...p, quiz: { score, total, at: new Date().toISOString() } })),
    [update]
  );

  return { progress, setResourceStatus, toggleWeek, toggleTask, saveQuizResult };
}

// Read-only snapshot of every department, for the Dashboard.
export function readAllDepartmentSummaries() {
  const all = readAllProgress();
  return DEPARTMENT_CODES.map((code) => ({
    code,
    summary: summarizeDepartment(readDepartmentProgress(all, code)),
  }));
}

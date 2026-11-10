// Browser-local persistence for the learning-support features
// (resource statuses, roadmap weeks, checklist tasks, last practice-quiz
// score). Stored in localStorage only - nothing here touches the backend,
// the database, or the assessment. Every storage access is wrapped in
// try/catch because localStorage can be missing or blocked.

export const PROGRESS_KEY = 'ccc_pathfinder_learning_progress';
export const LANGUAGE_KEY = 'ccc_pathfinder_learning_language';

const VALID_STATUS = ['to_watch', 'in_progress', 'completed'];

export function emptyDepartmentProgress() {
  return { resources: {}, weeks: {}, tasks: {}, quiz: null };
}

function safeGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function readAllProgress() {
  const raw = safeGet(PROGRESS_KEY);
  if (!raw) return { v: 1 };
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && parsed.v === 1 ? parsed : { v: 1 };
  } catch {
    return { v: 1 };
  }
}

export function writeAllProgress(all) {
  return safeSet(PROGRESS_KEY, JSON.stringify(all));
}

// Normalises whatever is stored so a corrupted entry can never crash a page.
export function readDepartmentProgress(all, code) {
  const stored = all?.[code];
  const base = emptyDepartmentProgress();
  if (!stored || typeof stored !== 'object') return base;
  const resources = {};
  if (stored.resources && typeof stored.resources === 'object') {
    Object.entries(stored.resources).forEach(([id, status]) => {
      if (VALID_STATUS.includes(status)) resources[id] = status;
    });
  }
  const bools = (obj) => {
    const out = {};
    if (obj && typeof obj === 'object') {
      Object.entries(obj).forEach(([k, val]) => {
        if (val === true) out[k] = true;
      });
    }
    return out;
  };
  const q = stored.quiz;
  const quiz =
    q && Number.isInteger(q.score) && Number.isInteger(q.total) && q.total > 0 ? q : null;
  return { resources, weeks: bools(stored.weeks), tasks: bools(stored.tasks), quiz };
}

export function summarizeDepartment(progress, { taskCount = 8, weekCount = 4 } = {}) {
  const res = Object.values(progress.resources);
  return {
    tasksDone: Object.keys(progress.tasks).length,
    taskCount,
    weeksDone: Object.keys(progress.weeks).length,
    weekCount,
    resourcesCompleted: res.filter((s) => s === 'completed').length,
    resourcesSaved: res.length,
    quiz: progress.quiz,
  };
}

export function readStoredLanguage() {
  const v = safeGet(LANGUAGE_KEY);
  return v === 'en' || v === 'fil' ? v : null;
}

export function writeStoredLanguage(lang) {
  if (lang === 'en' || lang === 'fil') safeSet(LANGUAGE_KEY, lang);
}

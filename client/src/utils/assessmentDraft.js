import { ASSESSMENT_QUESTIONS } from '../constants/assessmentQuestions';
import { SHS_TRACK_VALUES } from '../constants/shsTracks';

// Assessment draft - lets a student who refreshes the page in the middle of
// the 20-question assessment continue where they left off.
//
// Design choices (all client-side, no backend change):
// - sessionStorage, not localStorage: the draft lives only in this browser
//   tab and disappears when the tab is closed, so a student's name/school
//   are not left behind on a shared school computer.
// - Answers are stored by question id and the shuffled question order is
//   stored too, because the mixed order is generated again on every page
//   load; without the saved order the saved answers would line up with the
//   wrong questions.
// - The draft expires after DRAFT_MAX_AGE_MS and is validated field by
//   field; anything malformed, stale, or already submitted is discarded.
// - It is removed as soon as the assessment is submitted, restarted, or a
//   new assessment begins.
const DRAFT_KEY = 'ccc_pathfinder_assessment_draft';
const HISTORY_KEY = 'ccc_pathfinder_session_history';
const DRAFT_VERSION = 1;
const DRAFT_MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6 hours
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function clearAssessmentDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* storage unavailable - nothing to clear */
  }
}

function isCompletedSession(sessionId) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const history = raw ? JSON.parse(raw) : [];
    return Array.isArray(history) && history.some((entry) => entry && entry.sessionId === sessionId);
  } catch {
    return false;
  }
}

function validate(raw) {
  if (!raw || typeof raw !== 'object' || raw.v !== DRAFT_VERSION) return null;
  if (typeof raw.sessionId !== 'string' || !UUID_RE.test(raw.sessionId)) return null;
  if (raw.language !== 'en' && raw.language !== 'fil') return null;
  if (!raw.studentInfo || typeof raw.studentInfo !== 'object') return null;
  const savedAt = Date.parse(raw.savedAt);
  if (!Number.isFinite(savedAt) || Date.now() - savedAt > DRAFT_MAX_AGE_MS || savedAt > Date.now() + 60000) return null;

  const knownIds = ASSESSMENT_QUESTIONS.map((q) => q.id);
  const total = knownIds.length;
  if (!Array.isArray(raw.order) || raw.order.length !== total) return null;
  if (new Set(raw.order).size !== total || !raw.order.every((id) => knownIds.includes(id))) return null;

  if (!raw.answers || typeof raw.answers !== 'object') return null;
  for (const [id, value] of Object.entries(raw.answers)) {
    if (!knownIds.map(String).includes(id)) return null;
    if (!Number.isInteger(value) || value < 1 || value > 5) return null;
  }
  if (!Number.isInteger(raw.index) || raw.index < 0 || raw.index >= total) return null;
  if (isCompletedSession(raw.sessionId)) return null;
  return raw;
}

function readDraft() {
  try {
    const text = sessionStorage.getItem(DRAFT_KEY);
    if (!text) return null;
    const draft = validate(JSON.parse(text));
    if (!draft) clearAssessmentDraft();
    return draft;
  } catch {
    clearAssessmentDraft();
    return null;
  }
}

// Read once when the app loads. If a valid draft exists, put the question
// list back into the order the student was answering in (in place, so every
// importer of ASSESSMENT_QUESTIONS sees it) and expose the restored state.
function hydrate() {
  const draft = readDraft();
  if (!draft) return null;
  const byId = new Map(ASSESSMENT_QUESTIONS.map((q) => [q.id, q]));
  ASSESSMENT_QUESTIONS.splice(0, ASSESSMENT_QUESTIONS.length, ...draft.order.map((id) => byId.get(id)));
  const answers = {};
  ASSESSMENT_QUESTIONS.forEach((q, index) => {
    if (draft.answers[q.id] !== undefined) answers[index] = draft.answers[q.id];
  });
  // A draft saved before the Strengthened SHS Curriculum update may hold an old strand code.
  const studentInfo = { ...draft.studentInfo };
  if (studentInfo.strand && !SHS_TRACK_VALUES.includes(studentInfo.strand)) studentInfo.strand = '';
  return {
    sessionId: draft.sessionId,
    language: draft.language,
    studentInfo,
    answers,
    currentQuestionIndex: draft.index,
  };
}

export const restoredDraft = hydrate();

export function saveAssessmentDraft({ sessionId, language, studentInfo, answers, currentQuestionIndex }) {
  if (!sessionId || !language || !studentInfo) return;
  try {
    const byId = {};
    ASSESSMENT_QUESTIONS.forEach((q, index) => {
      if (answers[index] !== undefined) byId[q.id] = answers[index];
    });
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        v: DRAFT_VERSION,
        savedAt: new Date().toISOString(),
        sessionId,
        language,
        studentInfo,
        order: ASSESSMENT_QUESTIONS.map((q) => q.id),
        answers: byId,
        index: currentQuestionIndex,
      })
    );
  } catch {
    /* storage unavailable or full - assessment still works in memory */
  }
}

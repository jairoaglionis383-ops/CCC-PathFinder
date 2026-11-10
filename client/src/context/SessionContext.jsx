import { createContext, useContext, useReducer } from 'react';
import { restoredDraft, clearAssessmentDraft } from '../utils/assessmentDraft';

// SessionContext - the session/flow half of the Phase 2 State
// Management Approach (React Context + useReducer). Holds everything
// that needs to survive across the Student Info → Language →
// Assessment → Results steps within a single visit: the student info
// draft, selected questionnaire language, the assessment session
// identifier, which flow steps have been completed so far, and now
// (Student Dashboard milestone) a lightweight client-side history of
// completed session ids.
//
// Phase 10A: `sessionId` is the real backend-issued id from
// POST /api/v1/assessment/start, persisted to localStorage so a
// refresh mid-assessment doesn't orphan the in-progress session.
//
// Dashboard milestone: there is no student-account/authentication
// system (deliberately not built - see student.controller.js), so
// "previous assessment history" has no server-side identity to query
// by. The smallest solution that doesn't invent auth is to remember,
// client-side, which session ids THIS BROWSER has completed - each
// history entry is just { sessionId, completedAt }, added at the one
// reliable point a submission is known to have succeeded:
// AssessmentPage's handleNext() calling completeAssessment() only
// after POST /assessment/submit resolves without error. The full
// result for each historical id is still fetched for real from
// GET /api/v1/results/:sessionId when the Dashboard needs it (see
// useResultsHistory.js) - this context only remembers WHICH ids to
// ask for, never any score data itself.

const SessionContext = createContext(null);

const SESSION_ID_STORAGE_KEY = 'ccc_pathfinder_session_id';
const SESSION_HISTORY_STORAGE_KEY = 'ccc_pathfinder_session_history';

function readPersistedSessionId() {
  try {
    return localStorage.getItem(SESSION_ID_STORAGE_KEY);
  } catch {
    // Storage unavailable (private browsing, disabled storage, etc.) -
    // fall back to no persisted id rather than throwing.
    return null;
  }
}

function persistSessionId(sessionId) {
  try {
    if (sessionId) {
      localStorage.setItem(SESSION_ID_STORAGE_KEY, sessionId);
    } else {
      localStorage.removeItem(SESSION_ID_STORAGE_KEY);
    }
  } catch {
    // Non-fatal - the session still works in-memory for this visit.
  }
}

function readPersistedHistory() {
  try {
    const raw = localStorage.getItem(SESSION_HISTORY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistHistory(history) {
  try {
    localStorage.setItem(SESSION_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Non-fatal - history still works in-memory for this visit.
  }
}

// `draft` is only passed on the very first load (a refresh in the middle of an
// assessment); every later reset starts from a clean state.
function createInitialState(draft = null) {
  return {
    // No longer generated client-side - null until the backend issues
    // a real one (see AssessmentPage's session-start effect), unless a
    // prior visit already persisted one.
    sessionId: draft ? draft.sessionId : readPersistedSessionId(),
    // Read fresh from storage every time this runs (including after a
    // Retake's RESET_SESSION) so history is never accidentally wiped
    // by starting a new attempt - only completeAssessment() ever adds
    // to it, nothing ever removes from it.
    sessionHistory: readPersistedHistory(),
    studentInfo: draft ? draft.studentInfo : null,
    language: draft ? draft.language : null,
    flow: {
      studentInfoCompleted: Boolean(draft),
      languageSelected: Boolean(draft),
      assessmentStarted: Boolean(draft),
      assessmentCompleted: false,
    },
  };
}

function sessionReducer(state, action) {
  switch (action.type) {
    case 'SET_STUDENT_INFO':
      return {
        ...state,
        studentInfo: action.payload,
        flow: { ...state.flow, studentInfoCompleted: true },
      };

    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.payload,
        flow: { ...state.flow, languageSelected: true },
      };

    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.payload };

    case 'START_ASSESSMENT':
      return { ...state, flow: { ...state.flow, assessmentStarted: true } };

    case 'COMPLETE_ASSESSMENT':
      return {
        ...state,
        flow: { ...state.flow, assessmentCompleted: true },
        sessionHistory: action.payload?.sessionHistory ?? state.sessionHistory,
      };

    case 'RESET_SESSION':
      // keepLanguage: a "Take a New Assessment" keeps the chosen language so the
      // Language page can pre-select it; everything else is back to pristine.
      return {
        ...createInitialState(null),
        language: action.payload?.keepLanguage && state.language ? state.language : null,
      };

    default:
      return state;
  }
}

export function SessionProvider({ children }) {
  const [state, dispatch] = useReducer(sessionReducer, restoredDraft, createInitialState);

  const value = {
    state,
    setStudentInfo: (info) => dispatch({ type: 'SET_STUDENT_INFO', payload: info }),
    setLanguage: (language) => dispatch({ type: 'SET_LANGUAGE', payload: language }),
    setSessionId: (sessionId) => {
      persistSessionId(sessionId);
      dispatch({ type: 'SET_SESSION_ID', payload: sessionId });
    },
    startAssessment: () => dispatch({ type: 'START_ASSESSMENT' }),
    completeAssessment: () => {
      // Add the current session to history - dedupe first (so a
      // duplicate completion call never produces two entries for the
      // same id), then prepend so newest is always first. Nothing
      // here ever removes a previous entry.
      const withoutCurrent = state.sessionHistory.filter(
        (entry) => entry.sessionId !== state.sessionId
      );
      const nextHistory = state.sessionId
        ? [{ sessionId: state.sessionId, completedAt: new Date().toISOString() }, ...withoutCurrent]
        : state.sessionHistory;

      persistHistory(nextHistory);
      clearAssessmentDraft(); // submitted: nothing left to resume
      dispatch({ type: 'COMPLETE_ASSESSMENT', payload: { sessionHistory: nextHistory } });
    },
    resetSession: (options) => {
      // Retake: clears the active sessionId/studentInfo/language/flow
      // back to a pristine state so a new assessment can start, but
      // deliberately does NOT touch SESSION_HISTORY_STORAGE_KEY -
      // createInitialState() re-reads history from storage, so
      // previously completed sessions survive a retake automatically.
      persistSessionId(null);
      clearAssessmentDraft();
      dispatch({ type: 'RESET_SESSION', payload: { keepLanguage: Boolean(options?.keepLanguage) } });
    },
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession() must be used within a <SessionProvider>.');
  }
  return context;
}

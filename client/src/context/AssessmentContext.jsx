import { createContext, useContext, useReducer } from 'react';
import { ASSESSMENT_QUESTIONS } from '../constants/assessmentQuestions';
import { restoredDraft } from '../utils/assessmentDraft';

// AssessmentContext - the assessment half of the Phase 2 State
// Management Approach. Holds the state structure a questionnaire
// interaction needs: which question is current, what's been answered
// so far, and enough to derive progress/completion. This context
// still contains no scoring and no recommendation logic - it only
// tracks position and raw answer values. The Weighted Compatibility
// Scoring Algorithm (Phase 8) reads `answers` later; it isn't computed
// here.

const AssessmentContext = createContext(null);

// Derived from the real 20-question dataset (src/constants/
// assessmentQuestions.js) rather than a hardcoded number, so this
// context never needs editing if the dataset's size ever changes.
const TOTAL_QUESTIONS = ASSESSMENT_QUESTIONS.length;

const initialState = {
  currentQuestionIndex: 0,
  answers: {}, // { [questionIndex]: likertValue (1-5) }
  totalQuestions: TOTAL_QUESTIONS,
};

// After a page refresh mid-assessment, start from the saved draft (see
// utils/assessmentDraft.js); otherwise from the empty state.
const startState = restoredDraft
  ? { ...initialState, answers: restoredDraft.answers, currentQuestionIndex: restoredDraft.currentQuestionIndex }
  : initialState;

function assessmentReducer(state, action) {
  switch (action.type) {
    case 'ANSWER_QUESTION':
      return {
        ...state,
        answers: { ...state.answers, [action.payload.index]: action.payload.value },
      };

    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: Math.min(
          state.currentQuestionIndex + 1,
          state.totalQuestions - 1
        ),
      };

    case 'PREV_QUESTION':
      return {
        ...state,
        currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
      };

    case 'RESET_ASSESSMENT':
      return { ...initialState, answers: {} };

    default:
      return state;
  }
}

export function AssessmentProvider({ children }) {
  const [state, dispatch] = useReducer(assessmentReducer, startState);

  // Progress and completion are derived, not stored separately, so
  // they can never drift out of sync with answers/currentQuestionIndex.
  const answeredCount = Object.keys(state.answers).length;
  const isCurrentQuestionAnswered = state.answers[state.currentQuestionIndex] !== undefined;
  const isLastQuestion = state.currentQuestionIndex === state.totalQuestions - 1;
  const isComplete = answeredCount === state.totalQuestions;

  const progress = {
    current: state.currentQuestionIndex + 1,
    total: state.totalQuestions,
    answeredCount,
    percentage: Math.round(((state.currentQuestionIndex + 1) / state.totalQuestions) * 100),
  };

  const value = {
    state,
    progress,
    isCurrentQuestionAnswered,
    isLastQuestion,
    isComplete,
    answerQuestion: (index, value_) =>
      dispatch({ type: 'ANSWER_QUESTION', payload: { index, value: value_ } }),
    nextQuestion: () => dispatch({ type: 'NEXT_QUESTION' }),
    prevQuestion: () => dispatch({ type: 'PREV_QUESTION' }),
    resetAssessment: () => dispatch({ type: 'RESET_ASSESSMENT' }),
  };

  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment() must be used within an <AssessmentProvider>.');
  }
  return context;
}

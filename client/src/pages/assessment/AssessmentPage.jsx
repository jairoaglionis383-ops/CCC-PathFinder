import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import ProgressBar from '../../components/ui/ProgressBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { useAssessment } from '../../context/AssessmentContext';
import { useSession } from '../../context/SessionContext';
import { ASSESSMENT_QUESTIONS } from '../../constants/assessmentQuestions';
import { ROUTES, resultsPath } from '../../constants/routes';
import { startAssessmentSession, submitAssessment } from '../../services/assessmentService';
import { mapStudentInfoForSubmission } from '../../utils/mapStudentInfoForSubmission';
import { cx } from '../../utils/cx';
import { saveAssessmentDraft, clearAssessmentDraft } from '../../utils/assessmentDraft';

// AssessmentPage - the real 20-question interface, now connected to
// the Phase 7/8 backend (Phase 10A). Renders whichever question
// ASSESSMENT_QUESTIONS[currentQuestionIndex] is (still the unmodified
// local mixed dataset - see constants/assessmentQuestions.js; this
// file does not fetch questions from the backend, only start/submit),
// tracks answers in AssessmentContext, and only shows the Likert scale
// + Next/Back controls. Per Phase 1 §7, the assessment UI stays
// neutral - no department name, badge, or color is ever shown here.
//
// Two backend calls happen here, both through assessmentService.js
// (never Axios directly):
// - On mount, if SessionContext doesn't already have a sessionId
//   (e.g. from a prior visit persisted in localStorage), calls
//   POST /assessment/start once and stores the real id via
//   session.setSessionId(). If a sessionId already exists, this is
//   skipped entirely - a page refresh mid-assessment reuses the
//   existing session rather than generating an unrelated new one.
// - On finishing the last question, calls POST /assessment/submit
//   with the session id, mapped student info, language, and all 20
//   answers. Only on success does it navigate to Processing - a
//   failure is shown via ErrorState with a retry, never silently
//   treated as complete. No scoring happens here or anywhere in the
//   frontend; Phase 8's scoring.service.js remains the only
//   implementation.
const LIKERT_OPTIONS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];

// Display-only Filipino labels for the same 1-5 scale. The submitted
// value is always the number, never the label.
const LIKERT_LABELS_FIL = {
  1: 'Lubos na Hindi Sumasang-ayon',
  2: 'Hindi Sumasang-ayon',
  3: 'Neutral',
  4: 'Sumasang-ayon',
  5: 'Lubos na Sumasang-ayon',
};

export default function AssessmentPage() {
  const navigate = useNavigate();
  const {
    state,
    progress,
    isCurrentQuestionAnswered,
    isLastQuestion,
    answerQuestion,
    nextQuestion,
    prevQuestion,
    resetAssessment,
  } = useAssessment();
  const session = useSession();
  const { startAssessment, completeAssessment, setSessionId } = session;

  const [sessionStatus, setSessionStatus] = useState('idle'); // idle | loading | ready | error
  const [sessionError, setSessionError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle | submitting | error
  const [submitError, setSubmitError] = useState(null);

  // Browser Back from the results page lands here with a finished assessment:
  // send the student back to their results instead of silently starting a new
  // (blank) assessment. A real retake resets the flow first, so it is unaffected.
  const finishedSessionId = session.state.flow.assessmentCompleted ? session.state.sessionId : null;

  function beginSession() {
    if (finishedSessionId) return;
    startAssessment(); // local flow flag, unchanged from Milestone 5/6

    // A persisted session id is only reusable if it was never submitted
    // (e.g. a refresh in the middle of an assessment). An id that is
    // already in the completed-session history belongs to a finished
    // attempt: reusing it would make the backend reject the new
    // submission with "This session was already submitted", so a fresh
    // session is started instead and the old answers are cleared.
    const existingId = session.state.sessionId;
    const alreadyCompleted =
      Boolean(existingId) &&
      session.state.sessionHistory.some((entry) => entry.sessionId === existingId);

    if (existingId && !alreadyCompleted) {
      // Already have an unsubmitted session (e.g. persisted across a
      // refresh) - reuse it, don't start a second one.
      setSessionStatus('ready');
      return;
    }

    if (alreadyCompleted) {
      resetAssessment();
      clearAssessmentDraft();
    }

    setSessionStatus('loading');
    setSessionError(null);
    startAssessmentSession()
      .then(({ sessionId }) => {
        setSessionId(sessionId);
        setSessionStatus('ready');
      })
      .catch((err) => {
        setSessionError(err);
        setSessionStatus('error');
      });
  }

  useEffect(() => {
    beginSession();
    // Runs once on mount - re-running on every state change would
    // re-issue the start call unnecessarily.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep a refresh-proof copy of the in-progress assessment (tab-only
  // storage, removed on submit/restart - see utils/assessmentDraft.js).
  useEffect(() => {
    if (sessionStatus !== 'ready' || submitStatus === 'submitting') return;
    if (session.state.flow.assessmentCompleted) return;
    saveAssessmentDraft({
      sessionId: session.state.sessionId,
      language: session.state.language,
      studentInfo: session.state.studentInfo,
      answers: state.answers,
      currentQuestionIndex: state.currentQuestionIndex,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus, submitStatus, state.answers, state.currentQuestionIndex, session.state.sessionId]);

  const currentQuestion = ASSESSMENT_QUESTIONS[state.currentQuestionIndex];
  const questionText =
    session.state.language === 'fil' ? currentQuestion.textFil : currentQuestion.text;
  const selectedValue = state.answers[state.currentQuestionIndex];

  // Fresh start: clears answers, session id, student info, language and
  // flow flags (saved results/history are kept) and returns to Landing.
  function handleRestart() {
    resetAssessment();
    session.resetSession();
    navigate(ROUTES.landing, { replace: true });
  }

  async function handleNext() {
    if (!isLastQuestion) {
      nextQuestion();
      return;
    }

    setSubmitStatus('submitting');
    setSubmitError(null);

    const answers = ASSESSMENT_QUESTIONS.map((question, index) => ({
      questionId: question.id,
      likertValue: state.answers[index],
    }));

    try {
      await submitAssessment({
        sessionId: session.state.sessionId,
        studentInfo: mapStudentInfoForSubmission(session.state.studentInfo),
        language: session.state.language,
        answers,
      });
      completeAssessment();
      navigate(ROUTES.processing);
    } catch (err) {
      setSubmitError(err);
      setSubmitStatus('error');
    }
  }

  if (finishedSessionId) {
    return <Navigate to={resultsPath(finishedSessionId)} replace />;
  }

  if (sessionStatus === 'loading' || sessionStatus === 'idle') {
    return <LoadingState label="Preparing your assessment session…" />;
  }

  if (sessionStatus === 'error') {
    return (
      <ErrorState
        title="Couldn't start your assessment session"
        description={sessionError?.message || 'Please try again.'}
        onRetry={beginSession}
      />
    );
  }

  if (submitStatus === 'error') {
    // Network problems and server errors (no status / 5xx, plus 408 and
    // 429) can succeed on a second attempt, so "Try again" re-sends the
    // same answers. Any other error (e.g. 409 "already submitted" or a
    // 400 the backend rejected) would fail the same way every time, so
    // "Try again" starts over from the Landing Page with a clean state.
    const status = submitError?.status;
    const isRetryable = status === undefined || status >= 500 || status === 408 || status === 429;
    return (
      <ErrorState
        title="Couldn't submit your assessment"
        description={
          status === 409
            ? 'This assessment was already submitted. Please start a new one.'
            : submitError?.message || 'Your answers are still saved here - please try again.'
        }
        onRetry={isRetryable ? handleNext : handleRestart}
      />
    );
  }

  const answeredCount = Object.keys(state.answers).length;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 py-2">
      <div>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h1 className="font-display text-h3 font-bold text-navy">Assessment</h1>
            <p className="text-caption text-gray-dark">Answer based on how you naturally think and act.</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-small font-semibold text-navy">
              {answeredCount}/{progress.total}
            </p>
            <p className="text-caption text-gray-dark">answered</p>
          </div>
        </div>
        <ProgressBar
          value={progress.current}
          max={progress.total}
          label={`Question ${progress.current} of ${progress.total}`}
        />
      </div>

      <Card padding="p-8 sm:p-12" className="shadow-2">
        <div className="mb-6 flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-sky-mist font-display text-h3 font-bold text-sky-ink">
            {progress.current}
          </span>
        </div>

        <h2 className="mb-10 text-center font-display text-h2 font-bold text-navy sm:text-h1">
          {questionText}
        </h2>

        <div
          className="grid grid-cols-1 gap-3 sm:grid-cols-5"
          role="radiogroup"
          aria-label="Answer"
        >
          {LIKERT_OPTIONS.map((option) => {
            const isSelected = selectedValue === option.value;
            const label =
              session.state.language === 'fil' ? LIKERT_LABELS_FIL[option.value] : option.label;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => answerQuestion(state.currentQuestionIndex, option.value)}
                className={cx(
                  'flex items-center justify-center gap-2 rounded-md border-2 px-4 py-4 sm:flex-col sm:gap-1.5 sm:py-6',
                  'text-center text-small font-semibold leading-tight transition-all duration-150',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-sky bg-sky-ink text-white shadow-2'
                    : 'border-navy/10 bg-white text-navy hover:border-sky/50 hover:bg-sky-mist'
                )}
              >
                <span
                  className={cx(
                    'font-mono text-caption',
                    isSelected ? 'text-white/80' : 'text-gray-dark'
                  )}
                  aria-hidden="true"
                >
                  {option.value}
                </span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-center text-caption text-gray-dark">
          {isCurrentQuestionAnswered
            ? 'You can change your answer before moving on.'
            : 'Select one answer to continue.'}
        </p>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <Button variant="secondary" onClick={prevQuestion} disabled={state.currentQuestionIndex === 0}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={!isCurrentQuestionAnswered || submitStatus === 'submitting'}>
          {submitStatus === 'submitting' ? 'Submitting\u2026' : isLastQuestion ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

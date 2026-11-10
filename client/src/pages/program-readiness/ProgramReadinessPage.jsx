import { Link, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import DepartmentBadge from '../../features/recommendation/DepartmentBadge';
import { useReadiness } from '../../hooks/useReadiness';
import { useSession } from '../../context/SessionContext';
import { useAssessment } from '../../context/AssessmentContext';
import { useLearningLanguage } from '../../hooks/useLearningLanguage';
import { useLearningProgress } from '../../hooks/useLearningProgress';
import { LEARNING_CONTENT, LEARNING_UI } from '../../constants/learningContent';
import SkillsToDevelop from '../../features/readiness/SkillsToDevelop';
import LearningRoadmap from '../../features/readiness/LearningRoadmap';
import LearningResources from '../../features/readiness/LearningResources';
import MiniQuiz from '../../features/readiness/MiniQuiz';
import ReadinessChecklist from '../../features/readiness/ReadinessChecklist';
import ProjectsAndCareers from '../../features/readiness/ProjectsAndCareers';
import LearningProgressSummary from '../../features/readiness/LearningProgressSummary';
import { DEPARTMENTS } from '../../constants/departments';
import { ROUTES, resultsPath } from '../../constants/routes';

// ProgramReadinessPage - backend-driven. The department shown is
// decided by the :departmentCode route parameter (e.g. /readiness/DBA),
// which the Results page links to; useReadiness() loads
// GET /readiness/:departmentCode and the page renders exactly the
// sections the API returns, in the API's order. Section titles are the
// only thing defined client-side, since the API returns each section's
// `type` (matching the readiness_sections.section_type enum) rather
// than a display label. `colorKey` and `emoji` are presentation-only
// lookups from the DEPARTMENTS constant by code.
// Static class names so Tailwind keeps them in the build.
const SECTION_PRESENTATION = {
  overview: { icon: '🖥️', span: 'sm:col-span-2', surface: 'bg-white' },
  first_year_expectations: { icon: '📘', surface: 'bg-white' },
  major_subjects_overview: { icon: '🧩', surface: 'bg-white' },
  required_skills: { icon: '🧠', surface: 'bg-white' },
  common_challenges: { icon: '🛠️', surface: 'bg-white' },
  career_opportunities: { icon: '💼', span: 'sm:col-span-2', surface: 'bg-emerald-50/70' },
  preparation_tips: { icon: '💡', span: 'sm:col-span-2', surface: 'bg-amber-50/70' },
};

const ACCENT_CLASSES = {
  dte: { number: 'bg-dte-tint text-dte-text', hero: 'bg-dte-tint', name: 'text-dte-text' },
  dci: { number: 'bg-dci-tint text-dci-text', hero: 'bg-dci-tint', name: 'text-dci-text' },
  dba: { number: 'bg-dba-tint text-dba-text', hero: 'bg-dba-tint', name: 'text-dba-text' },
  das: { number: 'bg-das-tint text-das-text', hero: 'bg-das-tint', name: 'text-das-text' },
};

export default function ProgramReadinessPage() {
  const params = useParams();
  // Program codes are upper-case (DTE/DCI/DBA/DAS); accept /readiness/dci too.
  const departmentCode = (params.departmentCode || '').toUpperCase();
  const { data, isLoading, isError, error, refetch } = useReadiness(departmentCode);
  const { state } = useSession();
  const { state: assessmentState } = useAssessment();
  const lang = useLearningLanguage();
  const ui = LEARNING_UI[lang];
  const content = LEARNING_CONTENT[departmentCode];
  const { progress, setResourceStatus, toggleWeek, toggleTask, saveQuizResult } =
    useLearningProgress(departmentCode);

  if (isLoading) {
    return <LoadingState label={lang === 'fil' ? 'Nilo-load ang kahandaan sa programa…' : 'Loading program readiness…'} />;
  }

  if (isError) {
    return (
      <ErrorState
        title={lang === 'fil' ? 'Hindi ma-load ang kahandaan sa programa' : "Couldn't load program readiness"}
        description={error?.message || (lang === 'fil' ? 'Pakisubukan muli.' : 'Please try again.')}
        onRetry={refetch}
      />
    );
  }

  const { department, sections } = data;
  const identity = DEPARTMENTS[department.code];
  const colorKey = identity?.colorKey;
  const accent = ACCENT_CLASSES[colorKey];
  const badgeDepartment = { ...department, colorKey };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 pb-8">
      {/* Header */}
      <section className={`rounded-lg px-6 py-10 sm:px-10 ${accent ? accent.hero : 'bg-sky-mist'}`}>
        <p className="mb-3 font-mono text-caption uppercase tracking-wide text-sky-ink">
          {ui.pageTitle}
        </p>
        <div className="flex items-start gap-4">
          <span className="text-5xl leading-none" aria-hidden="true">
            {identity?.emoji}
          </span>
          <div className="min-w-0">
            <h1 className="mb-3 font-display text-display-2 font-extrabold text-navy">
              {department.name}
            </h1>
            {colorKey && <DepartmentBadge department={badgeDepartment} />}
          </div>
        </div>
        <p className="mt-5 max-w-xl text-small text-gray-dark">
          {ui.pageIntro}
        </p>
      </section>

      {/* Sections, exactly as returned by the API (English-only content,
          so its titles stay English too; a note explains this in fil) */}
      <div>
        {ui.contentNote && <p className="mb-3 text-caption text-gray-dark">{ui.contentNote}</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {sections.map((section, index) => {
            const presentation = SECTION_PRESENTATION[section.type] || { icon: '📌', surface: 'bg-white' };
            return (
              <article
                key={section.type}
                className={`group relative overflow-hidden rounded-2xl border border-navy/10 ${presentation.surface} p-5 shadow-1 transition duration-200 hover:-translate-y-0.5 hover:border-sky/30 hover:shadow-2 ${presentation.span || ''}`}
              >
                <div className="mb-4 flex items-start gap-3">
                  <span
                    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl ${
                      accent ? accent.number : 'bg-sky-mist text-sky-ink'
                    }`}
                    aria-hidden="true"
                  >
                    {presentation.icon}
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-gray-dark">
                      Section {String(index + 1).padStart(2, '0')}
                    </p>
                    <h2 className="font-display text-h3 font-bold leading-snug text-navy">
                      {LEARNING_UI.en.sections[section.type] || section.type}
                    </h2>
                  </div>
                </div>
                <details className="group/section mt-2 rounded-xl border border-navy/10 bg-white/70">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-navy outline-none transition hover:bg-sky-mist focus-visible:ring-2 focus-visible:ring-sky [&::-webkit-details-marker]:hidden">
                    <span>{lang === 'fil' ? 'Basahin ang detalye' : 'Read details'}</span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-mist text-lg transition group-open/section:rotate-45" aria-hidden="true">＋</span>
                  </summary>
                  <div className="border-t border-navy/10 px-4 py-3">
                    <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-dark marker:text-sky">
                      {String(section.content || '')
                        .split(/(?<=[.!?])\s+(?=[A-Z0-9“])/)
                        .filter(Boolean)
                        .map((point, pointIndex) => <li key={pointIndex}>{point.trim()}</li>)}
                    </ul>
                  </div>
                </details>
              </article>
            );
          })}
        </div>
      </div>

      {content && (
        <>
          <div>
            <h2 className="font-display text-h2 font-extrabold text-navy">{ui.startPreparing}</h2>
            <p className="mt-1 text-small text-gray-dark">{ui.startPreparingSub}</p>
            <nav aria-label={ui.startPreparing} className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {[
                { id: 'skills', icon: '🧠', note: lang === 'fil' ? 'Mga kasanayang lilinangin' : 'Skills to build' },
                { id: 'roadmap', icon: '🗺️', note: lang === 'fil' ? 'Gabay kada linggo' : 'Weekly learning plan' },
                { id: 'resources', icon: '▶', note: lang === 'fil' ? 'Mga video at aralin' : 'Videos and lessons' },
                { id: 'practice', icon: '✍', note: lang === 'fil' ? 'Subukan ang natutuhan' : 'Test your knowledge' },
                { id: 'checklist', icon: '☑', note: lang === 'fil' ? 'Mga gawaing matatapos' : 'Tasks to complete' },
                { id: 'projects', icon: '🧩', note: lang === 'fil' ? 'Proyekto at career' : 'Projects and careers' },
                { id: 'progress', icon: '📈', note: lang === 'fil' ? 'Tingnan ang progreso' : 'Track your progress' },
              ].map(({ id, icon, note }) => (
                <a key={id} href={`#${id}`} className="group flex min-h-28 flex-col items-start rounded-2xl border border-navy/10 bg-white p-4 shadow-1 transition hover:-translate-y-0.5 hover:border-sky/40 hover:shadow-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky">
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-mist text-lg text-navy" aria-hidden="true">{icon}</span>
                  <span className="text-sm font-bold text-navy">{ui.nav[id]}</span>
                  <span className="mt-1 text-xs leading-relaxed text-gray-dark">{note}</span>
                </a>
              ))}
            </nav>
          </div>

          <SkillsToDevelop
            skills={content.skills}
            answers={assessmentState.answers}
            ui={ui}
            lang={lang}
            colorKey={colorKey}
          />
          <LearningRoadmap
            roadmap={content.roadmap}
            resources={content.resources}
            progress={progress}
            onToggleWeek={toggleWeek}
            ui={ui}
            lang={lang}
            colorKey={colorKey}
          />
          <LearningResources
            resources={content.resources}
            progress={progress}
            onSetStatus={setResourceStatus}
            ui={ui}
            lang={lang}
            colorKey={colorKey}
          />
          <MiniQuiz
            key={`${departmentCode}-${lang}`}
            quiz={content.quiz}
            lastScore={progress.quiz}
            onFinish={saveQuizResult}
            ui={ui}
            lang={lang}
            colorKey={colorKey}
          />
          <ReadinessChecklist
            checklist={content.checklist}
            progress={progress}
            onToggle={toggleTask}
            ui={ui}
            lang={lang}
            colorKey={colorKey}
          />
          <ProjectsAndCareers
            projects={content.projects}
            careers={content.careers}
            ui={ui}
            lang={lang}
            colorKey={colorKey}
          />
          <LearningProgressSummary
            progress={progress}
            taskCount={content.checklist.length}
            ui={ui}
            colorKey={colorKey}
          />
        </>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {state.sessionId && (
          <Button as={Link} to={resultsPath(state.sessionId)} variant="secondary" size="lg">
            {ui.backToResults}
          </Button>
        )}
        <Button as={Link} to={ROUTES.dashboard} size="lg">
          {ui.goToDashboard}
        </Button>
      </div>
    </div>
  );
}

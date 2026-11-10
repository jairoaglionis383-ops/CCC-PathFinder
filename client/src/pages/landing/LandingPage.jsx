import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { ROUTES } from '../../constants/routes';
import { DEPARTMENTS, DEPARTMENT_CODES } from '../../constants/departments';

// LandingPage - presentation only. Layout follows the approved Figma
// reference (hero, how it works, departments, closing call-to-action),
// styled with the Phase 1 tokens and shared UI components. No session
// creation, API calls or guarding here: every "start" action is a plain
// route link to Student Information, exactly as before. Department
// names, mascots, emoji and colors all come from constants/departments.js.

// Full class names are listed statically so Tailwind can detect them
// (classes built with template strings would be purged from the build).
const COLOR_CLASSES = {
  dte: { pill: 'bg-dte-tint text-dte-text', code: 'text-dte-text' },
  dci: { pill: 'bg-dci-tint text-dci-text', code: 'text-dci-text' },
  dba: { pill: 'bg-dba-tint text-dba-text', code: 'text-dba-text' },
  das: { pill: 'bg-das-tint text-das-text', code: 'text-das-text' },
};

const STEPS = [
  {
    title: 'Answer the questionnaire',
    description: 'Respond to 20 short, situation-based statements about how you naturally think and act.',
  },
  {
    title: 'Get your Program recommendation',
    description:
      'Your answers are scored against each department’s weighted profile, and all four are ranked by compatibility.',
  },
  {
    title: 'View Program Readiness',
    description:
      'Explore what to expect in your first year, the skills involved, and how to prepare for the department that fits you best.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-20 pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-lg bg-soft-gradient px-6 py-14 sm:px-12 sm:py-20">
        <div className="relative max-w-2xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-pill bg-white px-3 py-1 font-mono text-caption uppercase tracking-wide text-sky-ink shadow-1">
            City College of Calamba
          </p>
          <h1 className="font-display text-display-2 sm:text-display-1 font-extrabold text-navy mb-5">
            Discover the right{' '}
            <span className="bg-hero-gradient bg-clip-text text-transparent">Program</span> for
            your future.
          </h1>
          <p className="text-body text-gray-dark mb-8 max-w-xl">
            A Program Recommendation and Readiness Support System for incoming first-year students.
            Answer 20 questions and find the academic department built for how you think.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button as={Link} to={ROUTES.studentInfo} size="lg">
              Start Assessment
            </Button>
            <Button as="a" href="#how-it-works" variant="secondary" size="lg">
              Learn More
            </Button>
          </div>

          <p className="mt-5 flex items-center gap-2 text-caption text-gray-dark">
            <span className="h-1.5 w-1.5 rounded-pill bg-sky" aria-hidden="true" />
            Free to use · No account required
          </p>
        </div>

        <ul className="relative mt-10 flex flex-wrap gap-3" aria-label="Academic departments">
          {DEPARTMENT_CODES.map((code) => {
            const d = DEPARTMENTS[code];
            return (
              <li
                key={code}
                className={`inline-flex items-center gap-2 rounded-pill px-4 py-2 text-small font-semibold ${COLOR_CLASSES[d.colorKey].pill}`}
              >
                <span aria-hidden="true">{d.emoji}</span>
                {d.mascotName}
              </li>
            );
          })}
        </ul>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-24">
        <div className="mx-auto mb-10 max-w-xl text-center">
          <p className="mb-2 font-mono text-caption uppercase tracking-wide text-sky-ink">How it works</p>
          <h2 className="font-display text-h1 font-extrabold text-navy mb-3">
            Three steps to find your academic path
          </h2>
          <p className="text-small text-gray-dark">
            PathFinder uses a weighted compatibility score across four departments. It is a guide to
            help you decide, not a final verdict.
          </p>
        </div>

        <ol className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Card hoverable className="h-full" padding="p-6">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-pill bg-hero-gradient font-display text-h3 font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="text-h3 text-navy mb-2">{step.title}</h3>
                <p className="text-small text-gray-dark">{step.description}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* Departments */}
      <section aria-labelledby="departments-heading">
        <div className="mb-8 max-w-xl">
          <p className="mb-2 font-mono text-caption uppercase tracking-wide text-sky-ink">
            Academic departments
          </p>
          <h2 id="departments-heading" className="font-display text-h1 font-extrabold text-navy">
            Four paths. One right fit for you.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DEPARTMENT_CODES.map((code) => {
            const d = DEPARTMENTS[code];
            return (
              <Card key={code} accent={d.colorKey} hoverable padding="p-5">
                <span className="mb-3 block text-3xl" aria-hidden="true">
                  {d.emoji}
                </span>
                <p className={`mb-1 font-mono text-caption uppercase tracking-wide ${COLOR_CLASSES[d.colorKey].code}`}>
                  {d.code}
                </p>
                <h3 className="text-h3 text-navy">{d.name}</h3>
                <p className="mt-1 text-small text-gray-dark">{d.mascotName}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Closing call to action */}
      <section className="rounded-lg bg-hero-gradient px-6 py-12 text-center sm:px-12">
        <h2 className="font-display text-h1 font-extrabold text-white mb-3">
          Ready to find your academic path?
        </h2>
        <p className="mx-auto mb-7 max-w-md text-small text-white/80">
          It takes a few minutes, and your results come with a readiness guide for the department
          that fits you best.
        </p>
        <Button as={Link} to={ROUTES.studentInfo} variant="secondary" size="lg">
          Start Assessment
        </Button>
      </section>
    </div>
  );
}

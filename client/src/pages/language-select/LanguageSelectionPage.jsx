import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StepIndicator from '../../components/ui/StepIndicator';
import { cx } from '../../utils/cx';
import { useSession } from '../../context/SessionContext';
import { ROUTES } from '../../constants/routes';

// LanguageSelectionPage - controlled selection wired into
// SessionContext. Clicking a card sets local `selected` state (plain
// UI state); Continue is disabled until a choice is made, then hands
// the choice to SessionContext.setLanguage() (which also flips
// flow.languageSelected for FlowGuard) and navigates forward. Per
// Phase 1: this choice affects only the questionnaire, nothing else
// in the site.
const FLOW_STEPS = ['Student Info', 'Language', 'Assessment', 'Results'];

const LANGUAGE_OPTIONS = [
  { code: 'en', flag: '\u{1F1EC}\u{1F1E7}', label: 'English', description: 'Answer the questionnaire in English.' },
  { code: 'fil', flag: '\u{1F1F5}\u{1F1ED}', label: 'Filipino', description: 'Sagutin ang talatanungan sa Filipino.' },
];

export default function LanguageSelectionPage() {
  const navigate = useNavigate();
  const { state, setLanguage } = useSession();
  // Pre-selected when a language is already known (e.g. after "Take a New Assessment").
  const [selected, setSelected] = useState(state.language === 'en' || state.language === 'fil' ? state.language : null);

  function handleContinue() {
    setLanguage(selected);
    navigate(ROUTES.assessment);
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-8 py-4">
      <StepIndicator steps={FLOW_STEPS} currentStep={1} />

      <div className="text-center">
        <p className="mb-3 inline-flex items-center rounded-pill bg-sky-mist px-3 py-1 font-mono text-caption uppercase tracking-wide text-sky-ink">
          Step 2 of {FLOW_STEPS.length}
        </p>
        <h1 className="font-display text-display-2 font-extrabold text-navy mb-3">
          Choose your language
        </h1>
        <p className="mx-auto max-w-sm text-body text-gray-dark">
          This sets the language of the questionnaire and the Program Readiness learning guide. Everything else stays in English.
        </p>
      </div>

      <Card padding="p-6 sm:p-8" className="shadow-2">
        <div className="flex flex-col gap-4" role="group" aria-label="Questionnaire language">
          {LANGUAGE_OPTIONS.map((language) => {
            const isSelected = selected === language.code;
            return (
              <button
                key={language.code}
                type="button"
                onClick={() => setSelected(language.code)}
                aria-pressed={isSelected}
                className={cx(
                  'flex w-full items-center gap-4 rounded-md border-2 p-5 text-left',
                  'transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-sky bg-sky-mist shadow-1'
                    : 'border-navy/10 bg-white hover:border-sky/50 hover:bg-sky-mist/60'
                )}
              >
                <span
                  className={cx(
                    'flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md text-3xl',
                    isSelected ? 'bg-white' : 'bg-gray-light'
                  )}
                  aria-hidden="true"
                >
                  {language.flag}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-h3 font-bold text-navy">
                    {language.label}
                  </span>
                  <span className="mt-0.5 block text-small text-gray-dark">
                    {language.description}
                  </span>
                </span>
                <span
                  className={cx(
                    'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-pill border-2 text-caption font-bold',
                    isSelected ? 'border-sky bg-sky-ink text-white' : 'border-navy/20 text-transparent'
                  )}
                  aria-hidden="true"
                >
                  {'\u2713'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <Button size="lg" fullWidth disabled={!selected} onClick={handleContinue}>
            Continue
          </Button>
          {!selected && (
            <p className="text-caption text-gray-dark">Please select a language to continue.</p>
          )}
        </div>
      </Card>

      <p className="flex items-center justify-center gap-2 text-center text-caption text-gray-dark">
        <span className="h-1.5 w-1.5 rounded-pill bg-sky" aria-hidden="true" />
        You can choose one questionnaire language per session.
      </p>
    </div>
  );
}

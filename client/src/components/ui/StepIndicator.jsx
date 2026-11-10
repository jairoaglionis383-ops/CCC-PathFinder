import { cx } from '../../utils/cx';

// StepIndicator - shows where the student is in the multi-step flow
// (Landing → Student Info → Language → Assessment → ... ). Purely
// presentational: takes the step list and current index as props,
// has no idea what route it's on or what step comes next - that's
// the router/FlowGuard's job once flow logic is approved.
export default function StepIndicator({ steps, currentStep, className = '' }) {
  return (
    <ol className={cx('flex items-center gap-2', className)} aria-label="Progress">
      {steps.map((step, index) => {
        const isComplete = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <li key={step} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <span
                aria-current={isCurrent ? 'step' : undefined}
                className={cx(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-pill font-mono text-small font-medium',
                  'transition-colors duration-150',
                  isComplete && 'bg-sky-ink text-white',
                  isCurrent && !isComplete && 'bg-white text-sky-ink border-2 border-sky',
                  !isComplete && !isCurrent && 'bg-gray-light text-gray-dark'
                )}
              >
                {isComplete ? (
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                    <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cx(
                  'hidden sm:inline text-small',
                  isCurrent ? 'text-navy font-medium' : 'text-gray-dark'
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <span
                className={cx('h-px flex-1', isComplete ? 'bg-sky' : 'bg-gray-light')}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

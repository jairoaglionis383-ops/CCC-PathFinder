import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

// SessionCompletion - the "Assessment Session Completed" card at the bottom of the
// Student Dashboard: a success message plus two actions.
//  - Take a New Assessment (primary): the parent starts a new, separate session.
//  - End Session (secondary): asks for confirmation in a Modal first.
// This is a session-ending function only (no accounts, no logout). Neither action
// deletes saved results or history - the parent only resets temporary state.
// Text follows the student's language setting ('en' | 'fil').
const TEXT = {
  en: {
    title: 'Assessment Session Completed',
    message:
      'You have successfully completed your CCC PathFinder assessment. Your program recommendations and readiness results are available in your dashboard.',
    newAssessment: 'Take a New Assessment',
    endSession: 'End Session',
    dialogTitle: 'End Your Session?',
    dialogMessage:
      'Are you sure you want to end your current session? Your saved assessment results and history will remain available.',
    cancel: 'Cancel',
    confirm: 'End Session',
  },
  fil: {
    title: 'Tapos na ang Sesyon ng Assessment',
    message:
      'Matagumpay mong natapos ang iyong CCC PathFinder assessment. Makikita sa iyong dashboard ang iyong mga rekomendasyon sa programa at mga resulta ng readiness.',
    newAssessment: 'Kumuha ng Bagong Assessment',
    endSession: 'Tapusin ang Sesyon',
    dialogTitle: 'Tapusin ang Iyong Sesyon?',
    dialogMessage:
      'Sigurado ka bang gusto mong tapusin ang kasalukuyan mong sesyon? Mananatiling available ang iyong mga naka-save na resulta at kasaysayan ng assessment.',
    cancel: 'Kanselahin',
    confirm: 'Tapusin ang Sesyon',
  },
};

export default function SessionCompletion({ language = 'en', onNewAssessment, onEndSession }) {
  const t = TEXT[language] || TEXT.en;
  const [confirming, setConfirming] = useState(false);

  return (
    <section aria-labelledby="session-completed-heading" lang={language === 'fil' ? 'fil' : 'en'}>
      <Card padding="p-6 sm:p-8" className="shadow-2">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-sky-mist text-sky-ink" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
          <h2 id="session-completed-heading" className="font-display text-h1 font-extrabold text-navy">
            {t.title}
          </h2>
          <p className="max-w-xl text-body text-gray-dark">{t.message}</p>
          <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
            <Button onClick={onNewAssessment}>{t.newAssessment}</Button>
            <Button variant="secondary" onClick={() => setConfirming(true)}>
              {t.endSession}
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title={t.dialogTitle}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              {t.cancel}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirming(false);
                onEndSession();
              }}
            >
              {t.confirm}
            </Button>
          </>
        }
      >
        <p lang={language === 'fil' ? 'fil' : 'en'}>{t.dialogMessage}</p>
      </Modal>
    </section>
  );
}

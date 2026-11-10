import { useState } from 'react';
import SectionShell from './SectionShell';
import Button from '../../components/ui/Button';

// Optional practice quiz. Entirely client-side and separate from the
// assessment: it never reads or writes assessment answers or scores.
// Only the last practice score is saved (to this browser).
export default function MiniQuiz({ quiz, lastScore, onFinish, ui, lang, colorKey }) {
  const total = quiz.questions.length;
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  function reset() {
    setStarted(true);
    setIndex(0);
    setPicked(null);
    setChecked(false);
    setScore(0);
    setFinished(false);
  }

  const q = quiz.questions[index];
  const isCorrect = checked && picked === q.answer;

  function check() {
    if (picked === null) return;
    setChecked(true);
    if (picked === q.answer) setScore((s) => s + 1);
  }

  function next() {
    if (index + 1 < total) {
      setIndex(index + 1);
      setPicked(null);
      setChecked(false);
    } else {
      setFinished(true);
      onFinish(score, total);
    }
  }

  return (
    <SectionShell id="practice" title={`${ui.practiceTitle}: ${quiz.title[lang]}`} subtitle={ui.practiceSub} colorKey={colorKey}>
      {!started && (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={reset}>{ui.startQuiz}</Button>
          {lastScore && <span className="text-small text-gray-dark">{ui.lastScore(lastScore.score, lastScore.total)}</span>}
        </div>
      )}

      {started && finished && (
        <div>
          <p className="font-display text-h3 font-bold text-navy">{ui.scoreOf(score, total)}</p>
          <Button className="mt-4" variant="secondary" onClick={reset}>
            {ui.tryAgain}
          </Button>
        </div>
      )}

      {started && !finished && (
        <div>
          <p className="font-mono text-caption uppercase tracking-wide text-sky-ink">{ui.questionOf(index + 1, total)}</p>
          <fieldset className="mt-2">
            <legend className="font-display text-body font-bold text-navy">{q.q[lang]}</legend>
            <div className="mt-3 flex flex-col gap-2">
              {q.options.map((opt, i) => {
                let tone = 'border-navy/10 hover:bg-sky-mist';
                if (checked && i === q.answer) tone = 'border-sky bg-sky-mist';
                else if (checked && i === picked) tone = 'border-navy/40 bg-gray-light';
                return (
                  <label key={i} className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-small text-navy ${tone}`}>
                    <input
                      type="radio"
                      name={`quiz-q-${index}`}
                      checked={picked === i}
                      disabled={checked}
                      onChange={() => setPicked(i)}
                      className="mt-1 accent-sky"
                    />
                    <span>{opt[lang]}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {checked && (
            <div role="status" className="mt-4 rounded-md bg-sky-mist p-4 text-small text-navy">
              <p className="font-bold">{isCorrect ? ui.correct : ui.notQuite}</p>
              <p className="mt-1">{q.explanation[lang]}</p>
            </div>
          )}

          <div className="mt-4">
            {!checked ? (
              <Button onClick={check} disabled={picked === null}>
                {ui.submitAnswer}
              </Button>
            ) : (
              <Button onClick={next}>{index + 1 < total ? ui.nextQuestion : ui.seeScore}</Button>
            )}
          </div>
        </div>
      )}
    </SectionShell>
  );
}

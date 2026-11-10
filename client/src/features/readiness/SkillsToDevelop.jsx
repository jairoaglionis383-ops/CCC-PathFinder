import SectionShell from './SectionShell';
import Badge from '../../components/ui/Badge';
import { ASSESSMENT_QUESTIONS } from '../../constants/assessmentQuestions';

// Suggested learning priorities. Uses ONLY the student's own answers to
// this department's five questions (from AssessmentContext, in this
// visit). A Likert value of 3 or less => suggested priority; 4-5 =>
// already comfortable. No answers => skills shown without priorities.
// Nothing is scored or stored here.
export function answersByQuestionId(answers) {
  const byId = {};
  Object.entries(answers || {}).forEach(([index, value]) => {
    const q = ASSESSMENT_QUESTIONS[Number(index)];
    if (q && Number.isInteger(value)) byId[q.id] = value;
  });
  return byId;
}

export default function SkillsToDevelop({ skills, answers, ui, lang, colorKey }) {
  const byId = answersByQuestionId(answers);
  const hasAnswers = skills.some((s) => byId[s.questionId] !== undefined);

  return (
    <SectionShell id="skills" title={ui.skillsTitle} subtitle={ui.skillsDisclaimer} colorKey={colorKey}>
      {!hasAnswers && (
        <p className="mb-4 rounded-md bg-sky-mist px-4 py-3 text-small text-navy">{ui.skillsNoAnswers}</p>
      )}
      <ul className="flex flex-col gap-3">
        {skills.map((skill) => {
          const value = byId[skill.questionId];
          const priority = value === undefined ? null : value <= 3;
          return (
            <li key={skill.questionId} className="rounded-md border border-navy/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-body font-bold text-navy">{skill.name[lang]}</h3>
                {priority !== null && (
                  <Badge tone={priority ? 'sky' : 'neutral'}>
                    {priority ? ui.priorityHigh : ui.priorityOk}
                  </Badge>
                )}
              </div>
              <p className="mt-2 text-small text-gray-dark">
                <span className="font-medium text-navy">{ui.skillAction}: </span>
                {skill.action[lang]}
              </p>
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}

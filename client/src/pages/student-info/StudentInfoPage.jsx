import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import PrivacyNotice from '../../features/privacy/PrivacyNotice';
import { SHS_TRACK_GROUPS, SHS_TRACK_VALUES } from '../../constants/shsTracks';
import StepIndicator from '../../components/ui/StepIndicator';
import { useSession } from '../../context/SessionContext';
import { useAssessment } from '../../context/AssessmentContext';
import { ROUTES } from '../../constants/routes';
import { useLearningLanguage } from '../../hooks/useLearningLanguage';
import { validateStudentInfo } from '../../utils/studentInfoValidation';

// StudentInfoPage - controlled form wired into SessionContext. Plain
// useState for field values (ordinary UI state, not business logic);
// on submit the draft is handed to SessionContext.setStudentInfo(),
// which also flips flow.studentInfoCompleted so FlowGuard allows the
// next step, then the page navigates forward. No validation rules,
// no API call. Name and Age are required and validated before the
// draft is saved or the page navigates (see utils/studentInfoValidation.js);
// validation messages follow the student's language setting when one
// exists (otherwise English).
const FLOW_STEPS = ['Student Info', 'Language', 'Assessment', 'Results'];

const GENDER_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const INITIAL_FORM = {
  fullName: '',
  age: '',
  gender: '',
  strand: '',
  schoolName: '',
  privacyAcknowledged: false,
  privacyConsent: false,
};

// Coming back to this page (browser Back, or a restored draft) keeps what the
// student already entered. An outdated or unknown track value is dropped.
function buildInitialForm(saved) {
  if (!saved) return INITIAL_FORM;
  return {
    ...INITIAL_FORM,
    ...saved,
    strand: SHS_TRACK_VALUES.includes(saved.strand) ? saved.strand : '',
    privacyAcknowledged: saved.privacyAcknowledged === true,
    privacyConsent: saved.privacyConsent === true,
  };
}

export default function StudentInfoPage() {
  const navigate = useNavigate();
  const session = useSession();
  const { setStudentInfo } = session;
  const { resetAssessment } = useAssessment();
  // Arriving here after a FINISHED assessment (e.g. Home via the logo, then Start Assessment)
  // is a new attempt: start from a clean form and clean temporary state. Saved results and
  // history are never touched (see SessionContext.resetSession).
  const startsFresh = session.state.flow.assessmentCompleted;
  useEffect(() => {
    if (startsFresh) {
      resetAssessment();
      session.resetSession({ keepLanguage: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const language = useLearningLanguage();
  const [form, setForm] = useState(() => buildInitialForm(startsFresh ? null : session.state.studentInfo));
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const ageInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const ackRef = useRef(null);
  const consentRef = useRef(null);

  const ageBadInput = () => Boolean(ageInputRef.current?.validity?.badInput);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    const nextForm = { ...form, [name]: type === 'checkbox' ? checked : value };
    setForm(nextForm);
    if (type === 'checkbox') {
      setErrors((previous) => ({ ...previous, [name]: undefined }));
      return;
    }
    // After a first failed attempt, re-check as the student types so the
    // message disappears as soon as the field is fixed.
    if (submitted && (name === 'fullName' || name === 'age')) {
      const result = validateStudentInfo(nextForm, language, { ageBadInput: ageBadInput() });
      setErrors((previous) => ({ ...previous, [name]: result.errors[name] }));
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = validateStudentInfo(form, language, { ageBadInput: ageBadInput() });
    setSubmitted(true);
    const privacyErrors = {
      privacyAcknowledged: !form.privacyAcknowledged,
      privacyConsent: !form.privacyConsent,
    };
    setErrors({ ...result.errors, ...privacyErrors });
    if (!result.isValid) {
      (result.errors.fullName ? nameInputRef : ageInputRef).current?.focus();
      return;
    }
    if (privacyErrors.privacyAcknowledged || privacyErrors.privacyConsent) {
      (privacyErrors.privacyAcknowledged ? ackRef : consentRef).current?.focus();
      return;
    }
    setStudentInfo({ ...form, fullName: result.cleanedName, age: String(Number(form.age)), schoolName: form.schoolName.trim() });
    navigate(ROUTES.languageSelect);
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-8 py-4">
      <StepIndicator steps={FLOW_STEPS} currentStep={0} />

      <div className="text-center">
        <p className="mb-3 inline-flex items-center rounded-pill bg-sky-mist px-3 py-1 font-mono text-caption uppercase tracking-wide text-sky-ink">
          Step 1 of {FLOW_STEPS.length}
        </p>
        <h1 className="font-display text-display-2 font-extrabold text-navy mb-3">
          Tell us about yourself
        </h1>
        <p className="text-body text-gray-dark">
          This helps us personalize your Program recommendation. Nothing here is shared publicly.
        </p>
      </div>

      <Card padding="p-6 sm:p-8" className="shadow-2">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
          <Input
            label="Full name"
            name="fullName"
            maxLength={120}
            placeholder="Juan Dela Cruz"
            value={form.fullName}
            onChange={handleChange}
            ref={nameInputRef}
            error={errors.fullName}
            autoComplete="name"
            required
            aria-required="true"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Age"
              name="age"
              type="number"
              inputMode="numeric"
              placeholder="18"
              value={form.age}
              onChange={handleChange}
              ref={ageInputRef}
              error={errors.age}
              required
              aria-required="true"
            />
            <Select
              label="Gender"
              name="gender"
              placeholder="Select gender"
              options={GENDER_OPTIONS}
              value={form.gender}
              onChange={handleChange}
            />
          </div>
          <Select
            label="SHS Track / Elective Cluster"
            name="strand"
            placeholder="Select your track or elective cluster"
            groups={SHS_TRACK_GROUPS}
            value={form.strand}
            onChange={handleChange}
          />
          <Input
            label="School name"
            name="schoolName"
            maxLength={200}
            placeholder="Optional"
            value={form.schoolName}
            onChange={handleChange}
          />

          <PrivacyNotice
            acknowledged={form.privacyAcknowledged}
            consent={form.privacyConsent}
            onChange={handleChange}
            errors={errors}
            ackRef={ackRef}
            consentRef={consentRef}
          />

          <Button type="submit" size="lg" fullWidth className="mt-2">
            Continue
          </Button>

          <p className="flex items-center justify-center gap-2 text-center text-caption text-gray-dark">
            <span className="h-1.5 w-1.5 rounded-pill bg-sky" aria-hidden="true" />
            Your details are saved with your results and used as explained in the Data Privacy Notice.
          </p>
        </form>
      </Card>
    </div>
  );
}

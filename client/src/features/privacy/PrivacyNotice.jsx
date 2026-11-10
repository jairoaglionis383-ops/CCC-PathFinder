import { useState } from 'react';
import Checkbox from '../../components/ui/Checkbox';
import { cx } from '../../utils/cx';
import { PRIVACY_CONTACT, PRIVACY_NOTICE } from '../../constants/privacyNotice';

// PrivacyNotice - the Data Privacy Notice block of the Student Information form:
// a short summary, an English / Filipino switch, the full notice (opens in place,
// no modal or extra page) and two separate checkboxes - acknowledgment of the notice
// and consent to processing. Both start unchecked; the parent form blocks Continue
// until both are ticked. The notice language switch is local to this block (the
// questionnaire language is chosen on the next screen).
export default function PrivacyNotice({ acknowledged, consent, onChange, errors = {}, ackRef, consentRef }) {
  const [lang, setLang] = useState('en');
  const t = PRIVACY_NOTICE[lang];
  const contactEntries = Object.entries(PRIVACY_CONTACT).filter(([, value]) => value);

  return (
    <section
      aria-labelledby="privacy-heading"
      className="flex flex-col gap-4 rounded-md border border-gray-dark/20 bg-gray-light p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="privacy-heading" className="font-display text-h3 font-bold text-navy">
          {t.blockTitle}
        </h2>
        <div role="group" aria-label="Notice language / Wika ng paunawa" className="inline-flex overflow-hidden rounded-md border border-gray-dark/30 bg-white">
          {['en', 'fil'].map((code) => (
            <button
              key={code}
              type="button"
              lang={code === 'fil' ? 'fil' : 'en'}
              aria-pressed={lang === code}
              onClick={() => setLang(code)}
              className={cx(
                'px-3 py-1.5 text-small font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky focus:ring-inset',
                lang === code ? 'bg-sky-ink text-white' : 'bg-white text-navy hover:bg-sky-mist'
              )}
            >
              {PRIVACY_NOTICE[code].toggle}
            </button>
          ))}
        </div>
      </div>

      <div lang={lang === 'fil' ? 'fil' : 'en'} className="flex flex-col gap-4">
        <p className="text-small text-gray-dark">{t.summary}</p>

        <details className="group rounded-md border border-gray-dark/20 bg-white">
          <summary className="cursor-pointer select-none rounded-md px-4 py-3 text-small font-semibold text-sky-ink focus:outline-none focus:ring-2 focus:ring-sky">
            {t.readFull}
          </summary>
          <div className="flex max-h-96 flex-col gap-5 overflow-y-auto border-t border-gray-dark/15 px-4 py-4" tabIndex={0} role="region" aria-label={t.fullTitle}>
            {t.sections.map((section, index) => (
              <div key={section.heading} className="flex flex-col gap-2">
                <h3 className="text-small font-bold text-navy">
                  {index + 1}. {section.heading}
                </h3>
                {section.paragraphs?.map((text) => (
                  <p key={text} className="text-small text-gray-dark">{text}</p>
                ))}
                {section.items && (
                  <ul className="list-disc space-y-1 pl-5 text-small text-gray-dark">
                    {section.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                )}
                {section.paragraphs2?.map((text) => (
                  <p key={text} className="text-small text-gray-dark">{text}</p>
                ))}
                {section.contactMissing && (
                  contactEntries.length > 0 ? (
                    <ul className="space-y-1 text-small text-gray-dark">
                      {contactEntries.map(([key, value]) => (
                        <li key={key}><span className="font-semibold text-navy">{t.contactLabels[key]}:</span> {value}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-small text-gray-dark">{section.contactMissing}</p>
                  )
                )}
              </div>
            ))}
          </div>
        </details>

        <p className="text-small text-gray-dark">{t.helpAcknowledgment}</p>

        <Checkbox
          ref={ackRef}
          name="privacyAcknowledged"
          checked={acknowledged}
          onChange={onChange}
          label={t.acknowledgmentLabel}
          error={errors.privacyAcknowledged ? t.acknowledgmentError : undefined}
          required
          aria-required="true"
        />
        <Checkbox
          ref={consentRef}
          name="privacyConsent"
          checked={consent}
          onChange={onChange}
          label={t.consentLabel}
          error={errors.privacyConsent ? t.consentError : undefined}
          required
          aria-required="true"
        />
      </div>
    </section>
  );
}

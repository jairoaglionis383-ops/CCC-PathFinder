// Validation rules + messages for the Student Information form.
// Pure functions (no React) so they can be tested on their own.
//
// Name   - required; letters of any language (accents/non-English
//          letters included), spaces, hyphens, apostrophes, periods and
//          commas ("Anne-Marie", "O'Connor", "Ma. Cristina", "Dela Cruz
//          Jr."). Digits and other symbols are rejected. Must contain at
//          least one letter. Max 100 characters (the backend keeps 100).
// Age    - required; a whole number from AGE_MIN to AGE_MAX.
//          Justification: incoming first-year students are normally
//          senior-high graduates (about 17-19), but accelerated and
//          returning adult learners exist, so 15-99 is wide enough not to
//          reject real students while still catching typos like 0, 5 or
//          500. The backend itself already treats ages of 130 or more as
//          invalid. Change the two constants below if the college sets an
//          official range.

export const AGE_MIN = 15;
export const AGE_MAX = 99;
export const NAME_MAX_LENGTH = 100;
export const SCHOOL_MAX_LENGTH = 200;

const NAME_ALLOWED = /^[\p{L}\p{M}][\p{L}\p{M} .,'’-]*$/u;

export const VALIDATION_MESSAGES = {
  en: {
    nameRequired: 'Please enter your full name.',
    nameInvalid:
      'Please enter a valid name. Use letters, spaces, hyphens or apostrophes only - no numbers or symbols.',
    nameTooLong: `Your name is too long (maximum ${NAME_MAX_LENGTH} characters).`,
    ageRequired: 'Please enter your age.',
    ageInvalid: 'Please enter your age as a whole number, like 18 (no decimals or letters).',
    ageRange: `Please enter an age from ${AGE_MIN} to ${AGE_MAX}.`,
  },
  fil: {
    nameRequired: 'Pakilagay ang iyong buong pangalan.',
    nameInvalid:
      'Maglagay ng wastong pangalan. Mga titik, espasyo, gitling o kudlit (apostrophe) lamang - bawal ang numero at simbolo.',
    nameTooLong: `Masyadong mahaba ang pangalan (hanggang ${NAME_MAX_LENGTH} karakter).`,
    ageRequired: 'Pakilagay ang iyong edad.',
    ageInvalid: 'Ilagay ang edad bilang buong bilang, tulad ng 18 (walang decimal o titik).',
    ageRange: `Maglagay ng edad mula ${AGE_MIN} hanggang ${AGE_MAX}.`,
  },
};

// Trims the ends and collapses runs of inner whitespace to one space.
export function cleanName(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

// `ageBadInput` is true when the browser's number box holds text it
// could not turn into a number (the field's value is then '').
export function validateStudentInfo(form, language = 'en', { ageBadInput = false } = {}) {
  const msg = VALIDATION_MESSAGES[language] || VALIDATION_MESSAGES.en;
  const errors = {};

  const name = cleanName(form.fullName);
  if (!name) errors.fullName = msg.nameRequired;
  else if (name.length > NAME_MAX_LENGTH) errors.fullName = msg.nameTooLong;
  else if (!NAME_ALLOWED.test(name)) errors.fullName = msg.nameInvalid;

  const ageText = String(form.age ?? '').trim();
  if (ageBadInput) errors.age = msg.ageInvalid;
  else if (!ageText) errors.age = msg.ageRequired;
  else if (!/^\d+$/.test(ageText)) errors.age = msg.ageInvalid;
  else {
    const age = Number(ageText);
    if (age < AGE_MIN || age > AGE_MAX) errors.age = msg.ageRange;
  }

  return { errors, isValid: Object.keys(errors).length === 0, cleanedName: name };
}

// Maps SessionContext's studentInfo draft (as captured by
// StudentInfoPage: fullName, age, gender, strand, schoolName) to the
// shape POST /api/v1/assessment/submit expects (firstName, lastName,
// email, seniorHighStrand, schoolName, additionalInfo). This exists
// because the two shapes are legitimately different for good reasons
// on each side (a single "Full name" field is simpler UI; the backend
// models first/last name separately per the Phase 3 schema) - rather
// than changing either one to match the other, this is the one place
// that translates between them.
//
// age/gender go into additionalInfo (JSON), per the Phase 3 decision
// that additional_info is for "optional expandable student
// information" and not for core searchable fields - which age/gender
// aren't.
export function mapStudentInfoForSubmission(studentInfo) {
  const fullName = (studentInfo?.fullName || '').trim();
  const [firstName, ...rest] = fullName.split(/\s+/).filter(Boolean);
  const lastName = rest.join(' ');

  return {
    firstName: firstName || 'Unknown',
    lastName: lastName || null, // one-word name: leave last name empty (do not copy the first name)
    seniorHighStrand: studentInfo?.strand || null,
    schoolName: studentInfo?.schoolName || null,
    additionalInfo: {
      age: studentInfo?.age || null,
      gender: studentInfo?.gender || null,
    },
  };
}

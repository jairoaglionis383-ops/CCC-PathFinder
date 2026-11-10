// Department metadata - single source of truth for the four academic
// groups (code, full name, mascot name, and the Tailwind color key
// used by Card/DepartmentBadge/CompatibilityBar). Both the assessment
// question dataset and any future results/readiness data should read
// department names from here rather than retyping them, so there's
// exactly one place these strings can drift out of sync.

export const DEPARTMENTS = Object.freeze({
  DTE: { code: 'DTE', emoji: '🐉', name: 'Teacher Education', mascotName: 'Green Dragon', colorKey: 'dte' },
  DCI: {
    code: 'DCI',
    emoji: '⚔️',
    name: 'Computing and Informatics',
    mascotName: 'Silver Vikings',
    colorKey: 'dci',
  },
  DBA: {
    code: 'DBA',
    emoji: '🐅',
    name: 'Business and Accountancy',
    mascotName: 'Yellow Tigers',
    colorKey: 'dba',
  },
  DAS: { code: 'DAS', emoji: '🐺', name: 'Arts and Sciences', mascotName: 'Winter Wolves', colorKey: 'das' },
});

export const DEPARTMENT_CODES = Object.freeze(['DTE', 'DCI', 'DBA', 'DAS']);

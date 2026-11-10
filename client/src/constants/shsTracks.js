// SHS Track / Elective Cluster options - Strengthened Senior High School (SHS) Curriculum.
// `value` is what is saved (stored in the existing `senior_high_strand` database column);
// `label` is what the student sees. The same list of values is enforced by the backend
// (server/src/services/assessment.service.js) - keep both lists identical.
export const SHS_TRACK_GROUPS = [
  {
    label: 'Academic Track',
    options: [
      { value: 'academic_arts_social_sciences_humanities', label: 'Arts, Social Sciences, and Humanities' },
      { value: 'academic_business_entrepreneurship', label: 'Business and Entrepreneurship' },
      { value: 'academic_stem', label: 'Science, Technology, Engineering, and Mathematics (STEM)' },
      { value: 'academic_sports_health_wellness', label: 'Sports, Health, and Wellness' },
      { value: 'academic_field_experience', label: 'Field Experience' },
    ],
  },
  {
    label: 'Technical Professional (TechPro) Track',
    options: [
      { value: 'techpro_aesthetic_wellness_human_care', label: 'Aesthetic, Wellness, and Human Care' },
      { value: 'techpro_agri_fishery_food_innovation', label: 'Agri-Fishery Business and Food Innovation' },
      { value: 'techpro_artisanry_creative_enterprise', label: 'Artisanry and Creative Enterprise' },
      { value: 'techpro_automotive_small_engine', label: 'Automotive and Small Engine Technologies' },
      { value: 'techpro_construction_building', label: 'Construction and Building Technologies' },
      { value: 'techpro_creative_arts_design', label: 'Creative Arts and Design Technologies' },
      { value: 'techpro_hospitality_tourism', label: 'Hospitality and Tourism' },
      { value: 'techpro_ict_support_programming', label: 'ICT Support and Computer Programming Technologies' },
      { value: 'techpro_industrial_technologies', label: 'Industrial Technologies' },
      { value: 'techpro_maritime', label: 'Maritime' },
    ],
  },
];

export const SHS_TRACK_VALUES = SHS_TRACK_GROUPS.flatMap((group) => group.options.map((option) => option.value));

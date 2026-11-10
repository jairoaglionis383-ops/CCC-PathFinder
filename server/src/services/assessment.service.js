const { v4: uuidv4 } = require('uuid');
const ApiError = require('../utils/ApiError');
const sessionModel = require('../models/assessmentSession.model');
const answerModel = require('../models/assessmentAnswer.model');
const scoring = require('./scoring.service');
const { pool } = require('../config/db');

const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} .,'’-]*$/u;
const AGE_MIN = 15;
const AGE_MAX = 99;

function startSession() {
  return { sessionId: uuidv4() };
}

function clean(value, max) {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s ? s.slice(0, max) : null;
}

// Strengthened SHS Curriculum tracks / elective clusters. Must match
// client/src/constants/shsTracks.js (a test compares the two lists).
const SHS_TRACK_CODES = [
  'academic_arts_social_sciences_humanities',
  'academic_business_entrepreneurship',
  'academic_stem',
  'academic_sports_health_wellness',
  'academic_field_experience',
  'techpro_aesthetic_wellness_human_care',
  'techpro_agri_fishery_food_innovation',
  'techpro_artisanry_creative_enterprise',
  'techpro_automotive_small_engine',
  'techpro_construction_building',
  'techpro_creative_arts_design',
  'techpro_hospitality_tourism',
  'techpro_ict_support_programming',
  'techpro_industrial_technologies',
  'techpro_maritime',
];

async function submit(payload) {
  const { sessionId, studentInfo, language, answers } = payload || {};
  if (!sessionId || typeof sessionId !== 'string') throw ApiError.badRequest('sessionId is required');
  if (!scoring.UUID_RE.test(sessionId)) throw ApiError.badRequest('sessionId must be a valid session id');
  if (!studentInfo || typeof studentInfo !== 'object') throw ApiError.badRequest('studentInfo is required');
  const firstName = clean(studentInfo.firstName, 100);
  if (!firstName) throw ApiError.badRequest('studentInfo.firstName is required');
  const rawLast = studentInfo.lastName;
  const lastNameClean = clean(rawLast, 100);
  if (String(studentInfo.firstName).trim().length > 100 || String(rawLast ?? '').trim().length > 100) {
    throw ApiError.badRequest('Name is too long (maximum 100 characters)');
  }
  if (!NAME_RE.test(firstName) || (lastNameClean && !NAME_RE.test(lastNameClean))) {
    throw ApiError.badRequest('Name may contain letters, spaces, hyphens and apostrophes only');
  }
  if (!Array.isArray(answers)) throw ApiError.badRequest('answers must be an array');

  if (language !== undefined && language !== null && language !== 'en' && language !== 'fil') {
    throw ApiError.badRequest("language must be 'en' or 'fil'");
  }
  const lang = language === 'fil' ? 'fil' : 'en';
  const data = await scoring.loadScoringData();

  if (answers.length !== data.questions.length) {
    throw ApiError.badRequest(`Expected exactly ${data.questions.length} answers, received ${answers.length}`);
  }
  const seen = new Set();
  const normalized = answers.map((a) => {
    const questionId = Number(a && a.questionId);
    const likertValue = a && typeof a.likertValue === 'number' ? a.likertValue : NaN;
    if (!data.questionById.has(questionId)) throw ApiError.badRequest(`Unknown questionId: ${a && a.questionId}`);
    if (seen.has(questionId)) throw ApiError.badRequest(`Duplicate answer for questionId ${questionId}`);
    if (!Number.isInteger(likertValue) || likertValue < 1 || likertValue > 5) {
      throw ApiError.badRequest(`likertValue must be an integer from 1 to 5 (questionId ${questionId})`);
    }
    seen.add(questionId);
    return { questionId, likertValue };
  });

  const extra = studentInfo.additionalInfo || {};
  for (const [label, value, max] of [
    ['schoolName', studentInfo.schoolName, 200],
    ['seniorHighStrand', studentInfo.seniorHighStrand, 100],
    ['gender', extra.gender, 50],
  ]) {
    if (value !== undefined && value !== null && (typeof value !== 'string' || value.trim().length > max)) {
      throw ApiError.badRequest(`${label} must be text of at most ${max} characters`);
    }
  }
  const strandValue = typeof studentInfo.seniorHighStrand === 'string' ? studentInfo.seniorHighStrand.trim() : '';
  if (strandValue && !SHS_TRACK_CODES.includes(strandValue)) {
    throw ApiError.badRequest('seniorHighStrand is not a recognised SHS Track / Elective Cluster');
  }
  const ageText = extra.age === undefined || extra.age === null ? '' : String(extra.age).trim();
  let age = null;
  if (ageText) {
    if (!/^\d+$/.test(ageText) || Number(ageText) < AGE_MIN || Number(ageText) > AGE_MAX) {
      throw ApiError.badRequest(`age must be a whole number from ${AGE_MIN} to ${AGE_MAX}`);
    }
    age = Number(ageText);
  }

  if (await sessionModel.findById(sessionId)) throw ApiError.conflict('This session was already submitted');

  // Session, answers and scores are written in ONE transaction: either all
  // three are saved or none are, so a failure can never leave a "completed"
  // session without results. A duplicate id (including two simultaneous
  // submits) hits the primary key and is reported as 409.
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await sessionModel.create({
      id: sessionId,
      firstName,
      lastName: lastNameClean,
      age,
      gender: clean(extra.gender, 50),
      strand: clean(studentInfo.seniorHighStrand, 100),
      schoolName: clean(studentInfo.schoolName, 200),
      language: lang,
    }, conn);
    await answerModel.bulkInsert(sessionId, normalized, conn);
    await scoring.calculateAndSave(sessionId, normalized, data, conn);
    await conn.commit();
  } catch (err) {
    await conn.rollback().catch(() => {});
    if (err && err.code === 'ER_DUP_ENTRY') throw ApiError.conflict('This session was already submitted');
    throw err;
  } finally {
    conn.release();
  }

  return { sessionId, submittedAt: new Date().toISOString() };
}

module.exports = {
  SHS_TRACK_CODES,
  startSession,
  submit,
};

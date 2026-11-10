// Weighted Compatibility Scoring (department level).
//   rawScore       = sum(weight * effectiveLikert)   (effective = value, or 6 - value if reverse-scored)
//   maxPossible    = sum(weight * 5)
//   percentageScore= round(raw / max * 10000) / 100
// Sorted by percentage desc, then department code asc.
// Ranking is standard competition ranking (ties share a rank: 1,1,3,4).
const questionModel = require('../models/question.model');
const weightModel = require('../models/questionDepartmentWeight.model');
const departmentModel = require('../models/department.model');
const resultScoreModel = require('../models/resultScore.model');
const sessionModel = require('../models/assessmentSession.model');
const ApiError = require('../utils/ApiError');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function computeScores(answers, questionById, weightsByQuestionId, departments) {
  const totals = new Map(departments.map((d) => [d.id, { raw: 0, max: 0 }]));

  for (const answer of answers) {
    const question = questionById.get(answer.questionId);
    const weights = weightsByQuestionId.get(answer.questionId) || [];
    const effective = question.is_reverse_scored ? 6 - answer.likertValue : answer.likertValue;
    for (const w of weights) {
      const t = totals.get(w.department_id);
      if (!t) continue;
      t.raw += Number(w.weight) * effective;
      t.max += Number(w.weight) * 5;
    }
  }

  const scored = departments.map((d) => {
    const t = totals.get(d.id);
    const percentageScore = t.max > 0 ? Math.round((t.raw / t.max) * 10000) / 100 : 0;
    return {
      departmentId: d.id,
      departmentCode: d.code,
      rawScore: Math.round(t.raw * 100) / 100,
      percentageScore,
    };
  });

  scored.sort((a, b) =>
    b.percentageScore - a.percentageScore || a.departmentCode.localeCompare(b.departmentCode)
  );

  let previousPct = null;
  let previousRank = 0;
  return scored.map((s, index) => {
    const rank = s.percentageScore === previousPct ? previousRank : index + 1;
    previousPct = s.percentageScore;
    previousRank = rank;
    return { ...s, rank };
  });
}

async function loadScoringData() {
  const [questions, weights, departments] = await Promise.all([
    questionModel.findAllActive(),
    weightModel.findAll(),
    departmentModel.findAll(),
  ]);
  const questionById = new Map(questions.map((q) => [q.id, q]));
  const weightsByQuestionId = new Map();
  for (const w of weights) {
    if (!weightsByQuestionId.has(w.question_id)) weightsByQuestionId.set(w.question_id, []);
    weightsByQuestionId.get(w.question_id).push(w);
  }
  return { questions, questionById, weightsByQuestionId, departments };
}

async function calculateAndSave(sessionId, answers, data, db) {
  const scores = computeScores(answers, data.questionById, data.weightsByQuestionId, data.departments);
  await resultScoreModel.bulkInsert(sessionId, scores, db);
  return scores;
}

async function getResultsForSession(sessionId) {
  // Session ids are UUIDs issued by POST /assessment/start; anything else
  // cannot exist, so answer "not found" without touching the database.
  if (!UUID_RE.test(String(sessionId))) throw ApiError.notFound('Session not found');
  const session = await sessionModel.findById(sessionId);
  if (!session) throw ApiError.notFound('Session not found');
  const rows = await resultScoreModel.findBySessionId(sessionId);
  if (!rows.length) throw ApiError.notFound('No results found for this session');
  return {
    sessionId,
    assessmentDate: session.completed_at,
    results: rows.map((r) => ({
      departmentCode: r.department_code,
      departmentName: r.department_name,
      mascotName: r.mascot_name,
      percentageScore: Number(r.percentage_score),
      rank: r.rank_position,
    })),
  };
}

module.exports = { UUID_RE, computeScores, loadScoringData, calculateAndSave, getResultsForSession };

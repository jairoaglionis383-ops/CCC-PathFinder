const { pool } = require('../config/db');

async function bulkInsert(sessionId, answers, db = pool) {
  if (!answers.length) return;
  const placeholders = answers.map(() => '(?, ?, ?)').join(', ');
  const values = answers.flatMap((a) => [sessionId, a.questionId, a.likertValue]);
  await db.query(
    `INSERT INTO assessment_answers (session_id, question_id, likert_value) VALUES ${placeholders}`,
    values
  );
}
module.exports = { bulkInsert };

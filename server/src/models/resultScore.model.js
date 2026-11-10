const { pool } = require('../config/db');

async function bulkInsert(sessionId, scores, db = pool) {
  if (!scores.length) return;
  const placeholders = scores.map(() => '(?, ?, ?, ?, ?)').join(', ');
  const values = scores.flatMap((s) => [sessionId, s.departmentId, s.rawScore, s.percentageScore, s.rank]);
  await db.query(
    `INSERT INTO result_scores (session_id, department_id, raw_score, percentage_score, rank_position) VALUES ${placeholders}`,
    values
  );
}

async function findBySessionId(sessionId) {
  const [rows] = await pool.query(
    `SELECT rs.department_id, rs.raw_score, rs.percentage_score, rs.rank_position,
            d.code AS department_code, d.name AS department_name, d.mascot_name
     FROM result_scores rs
     JOIN departments d ON d.id = rs.department_id
     WHERE rs.session_id = :sessionId
     ORDER BY rs.rank_position ASC, d.code ASC`,
    { sessionId }
  );
  return rows;
}
module.exports = { bulkInsert, findBySessionId };

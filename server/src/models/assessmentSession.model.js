const { pool } = require('../config/db');

async function create(s, db = pool) {
  await db.query(
    `INSERT INTO assessment_sessions
       (id, first_name, last_name, age, gender, senior_high_strand, school_name, language, status, started_at, completed_at)
     VALUES
       (:id, :firstName, :lastName, :age, :gender, :strand, :schoolName, :language, 'completed', NOW(), NOW())`,
    s
  );
}
async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM assessment_sessions WHERE id = :id', { id });
  return rows[0] || null;
}
module.exports = { create, findById };

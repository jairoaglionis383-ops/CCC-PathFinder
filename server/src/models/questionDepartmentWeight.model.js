const { pool } = require('../config/db');

async function findAll() {
  const [rows] = await pool.query(
    `SELECT w.question_id, w.department_id, d.code AS department_code, w.weight
     FROM question_department_weights w
     JOIN departments d ON d.id = w.department_id`
  );
  return rows;
}
module.exports = { findAll };

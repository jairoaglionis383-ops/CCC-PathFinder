const { pool } = require('../config/db');

async function findAll() {
  const [rows] = await pool.query('SELECT id, code, name, mascot_name FROM departments ORDER BY id');
  return rows;
}
async function findByCode(code) {
  const [rows] = await pool.query(
    'SELECT id, code, name, mascot_name FROM departments WHERE code = :code',
    { code }
  );
  return rows[0] || null;
}
module.exports = { findAll, findByCode };

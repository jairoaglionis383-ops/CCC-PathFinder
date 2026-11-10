const { pool } = require('../config/db');

async function findAllActive() {
  const [rows] = await pool.query(
    'SELECT id, text_en, text_fil, is_reverse_scored FROM questions WHERE is_active = 1 ORDER BY id'
  );
  return rows;
}
module.exports = { findAllActive };

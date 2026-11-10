const { pool } = require('../config/db');

async function findByDepartmentId(departmentId) {
  const [rows] = await pool.query(
    `SELECT section_type, content, display_order
     FROM readiness_sections WHERE department_id = :departmentId
     ORDER BY display_order ASC`,
    { departmentId }
  );
  return rows;
}
module.exports = { findByDepartmentId };

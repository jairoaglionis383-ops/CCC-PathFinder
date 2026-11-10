const ApiError = require('../utils/ApiError');
const departmentModel = require('../models/department.model');
const readinessModel = require('../models/readinessSection.model');

async function getReadiness(departmentCode) {
  const code = String(departmentCode || '').toUpperCase();
  const department = await departmentModel.findByCode(code);
  if (!department) throw ApiError.notFound(`Unknown department: ${departmentCode}`);
  const sections = await readinessModel.findByDepartmentId(department.id);
  if (!sections.length) throw ApiError.notFound('No readiness content for this department');
  return {
    department: { code: department.code, name: department.name, mascotName: department.mascot_name },
    sections: sections.map((s) => ({ type: s.section_type, content: s.content, displayOrder: s.display_order })),
  };
}
module.exports = { getReadiness };

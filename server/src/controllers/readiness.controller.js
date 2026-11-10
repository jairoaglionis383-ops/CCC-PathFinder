const asyncHandler = require('../middlewares/asyncHandler');
const { success } = require('../utils/apiResponse');
const service = require('../services/readiness.service');

exports.getReadiness = asyncHandler(async (req, res) =>
  success(res, await service.getReadiness(req.params.departmentCode)));

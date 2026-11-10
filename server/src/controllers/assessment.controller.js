const asyncHandler = require('../middlewares/asyncHandler');
const { success } = require('../utils/apiResponse');
const service = require('../services/assessment.service');

exports.start = asyncHandler(async (req, res) => success(res, service.startSession(), 'Session created', 201));
exports.submit = asyncHandler(async (req, res) => success(res, await service.submit(req.body), 'Assessment submitted', 201));

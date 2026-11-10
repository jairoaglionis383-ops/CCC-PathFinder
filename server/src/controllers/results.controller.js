const asyncHandler = require('../middlewares/asyncHandler');
const { success } = require('../utils/apiResponse');
const scoring = require('../services/scoring.service');

exports.getResults = asyncHandler(async (req, res) =>
  success(res, await scoring.getResultsForSession(req.params.sessionId)));

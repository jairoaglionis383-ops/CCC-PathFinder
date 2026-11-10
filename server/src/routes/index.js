const express = require('express');
const assessment = require('../controllers/assessment.controller');
const results = require('../controllers/results.controller');
const readiness = require('../controllers/readiness.controller');

const router = express.Router();
router.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok' }, message: 'OK' }));
router.post('/assessment/start', assessment.start);
router.post('/assessment/submit', assessment.submit);
router.get('/results/:sessionId', results.getResults);
router.get('/readiness/:departmentCode', readiness.getReadiness);
module.exports = router;

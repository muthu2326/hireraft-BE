var express = require('express');
var router = express.Router();
var jobs=require("../controller/jobs.server.controller");

/* POST users listing. */
router.post('/',jobs.getjob);

/* POST user apply for a job. */
router.post('/apply',jobs.applyJobNew);

/* GET user apply for a job. */
router.get('/count',jobs.getJobsCount);

/* GET job by ID. */
router.get('/:job_id',jobs.getJobById);

module.exports = router;

var express = require('express');
var router = express.Router();
var jobs=require("../controller/jobs.server.controller");

/* POST users listing. */
router.post('/',jobs.getjob);

router.post('/update/recommendation',jobs.updateJobsRecommendations);

router.post('/create',jobs.createJob);

router.put('/:job_id',jobs.editJob);

router.delete('/:job_id',jobs.removeJob);

/* GET recommended jobs. */
router.get('/recommendations',jobs.getRecommendedJobs);

/* POST user apply for a job. */
router.post('/apply',jobs.applyJobNew);

/* Post Job View */
router.post('/:job_id/action',jobs.storeJobAction);

/* GET Job Analytics */
router.get('/cms/analytics',jobs.jobAnalytics);

/* POST user apply for a job. */
router.post('/cms/apply',jobs.applyForCMSJobNew);

/* GET user apply for a job. */
router.get('/count',jobs.getJobsCount);

/* GET job by ID. */
router.get('/:job_id',jobs.getJobById);

router.get('/recruiters/details',jobs.getJobContactPersionDetails);

module.exports = router;

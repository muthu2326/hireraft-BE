var express = require('express');
var router = express.Router();
var hr=require("../controller/hr.server.controller");

/* GET hireraft summary. */
router.get('/dashboard/summary', hr.getJobsSummary);

module.exports = router;

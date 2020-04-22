var express = require('express');
var router = express.Router();
var jobs=require("../controller/jobs.server.controller");

/* GET users listing. */
router.post('/',jobs.getjob);

module.exports = router;

var express = require('express');
var router = express.Router();
var states=require("../controller/states.server.controller");

/* GET states. */
router.get('/cities', states.getStatesAndCities);

module.exports = router;
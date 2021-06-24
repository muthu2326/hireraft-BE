var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: 'tmp/users/' }); // for parsing multipart/form-data
var campaign = require("../controller/campaign.server.controller");
var {authenticate} = require("../middleware/middleware")

/* POST store campaign details. */
router.post('/logs', campaign.storeCampaignLog);

router.get('/analytics', campaign.getCampaignAnalytics);

router.get('/analytics/:uuid', campaign.getCampaignDetailsByUUID);

module.exports = router;

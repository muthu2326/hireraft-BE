var express = require('express');
var router = express.Router();
var employer = require("../controller/employers.server.controller");

/* POST store employer details. */
router.post('/:encrypt_id/candidates/shorlist', employer.storeEmployerAndCandidates);

/* GET shorlisted candidates. */
router.get('/:encrypt_id/candidates/shorlist', employer.getShorlistedCandidates);

/* GET employer decrypt. */
router.get('/:encrypt_id/decrypt',employer.decryptEmployerData);

module.exports = router;

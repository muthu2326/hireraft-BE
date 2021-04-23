var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: 'tmp/users/' }); // for parsing multipart/form-data
var employer = require("../controller/employers.server.controller");

/* POST store employer details. */
router.post('/:encrypt_id/candidates/shorlist', employer.storeEmployerAndCandidates);

/* GET shorlisted candidates. */
router.get('/:encrypt_id/candidates/shorlist', employer.getShorlistedCandidates);

/* GET employer decrypt. */
router.get('/:encrypt_id/decrypt',employer.decryptEmployerData);

router.post('/upload/generate/hash', upload.single('file'), employer.generateHashForEmails);

module.exports = router;

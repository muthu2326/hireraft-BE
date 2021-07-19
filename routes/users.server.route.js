var express = require('express');
var router = express.Router();
var users=require("../controller/users.server.controller");
var multer = require('multer');
var upload = multer({ dest: 'tmp/users/' }); // for parsing multipart/form-data
var {authenticate} = require("../middleware/middleware")

/* POST users regsistration. */
router.post('/register',users.userRegistration);

/* Get all registered users */
router.get('/',users.getAllUsers);

/* Get all registered users */
router.get('/:user_id',users.getUserById);

router.get('/:user_id/jobs',users.getUserJobs);

router.get('/:user_id/cms/jobs',users.getUserCMSJobs);

router.get('/:encrypt_id/decrypt', authenticate, users.decryptUserData);

router.post('/upload/generate/hash', upload.single('file'), users.generateHashForEmails);

router.post('/survey', users.postSurvey);

router.get('/:encrypt_id/survey', users.getSurveyByEncryptedId);

module.exports = router;
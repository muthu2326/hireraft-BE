var express = require('express');
var router = express.Router();
var users=require("../controller/users.server.controller");

/* POST users regsistration. */
router.post('/register',users.userRegistration);

/* Get all registered users */
router.get('/',users.getAllUsers);

/* Get all registered users */
router.get('/:user_id',users.getUserById);

module.exports = router;

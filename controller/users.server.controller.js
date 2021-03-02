var waterfall = require('async-waterfall');
var utility = require('../service/utils')
const message = require("../service/message.json");

const RegisteredUsers = require('../models/RegisteredUsersSchema');

exports.userRegistration = function (req, res) {
    console.log('Entering userRegistration')
    console.log('Request Body :: ', req.body)
    console.log('Request params :: ', req.params)
    console.log("request query :: ", req.query);

    if (!req.body.email || !req.body.name || !req.body.phone || !req.body.course || !req.body.skills || !req.body.joining_by) {
        let response = {
            status: 400,
            data: {},
            error: {
                msg: message.missing_fields,
            },
        };
        res.status(400).jsonp(response);
        return;
    }

    let users_request = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        course: req.body.course,
        passing_year: req.body.passing_year,
        skills: req.body.skills,
        joining_by: req.body.joining_by
    }

    const user = new RegisteredUsers(users_request)
    user.save((err, response) => {
        if (err) {
            console.log('err in user regsitration', err)
            console.log('Exiting userRegistration')
            res.send({
                status: 500,
                data: {},
                err: {
                    msg: message.something_went_wrong,
                    err: err
                }
            })
            return;
        }
        response.msg = "Successfully Registered"
        console.log('Exiting userRegistration')
        res.send({
            status: 200,
            data: response,
            err: {}
        })
        return;
    })
}

/*Get a single user */
exports.getUserById = function (req, res) {
    console.log("User Controller: entering getUser")
    console.log('Request params :: ', req.params)
    console.log("request query :: ", req.query);

    /*Validate for a null id*/
    if (!req.params.user_id) {
        console.log("missing user_id in params");
        res.status(400).jsonp({
            status: 400,
            data: {},
            message: message.invalid_get_request,
        });
        return;
    }

    var user_id = req.params.user_id;

    RegisteredUsers.findById(user_id, function (err, user) {
        if (err) {
            console.log('err in finding user', err)
            res.status(500).jsonp({
                status: 500,
                data: {},
                error: {
                    msg: message.something_went_wrong,
                    err: err,
                },
            });
            return;
        }
        console.log('user response', user)
        if (user) {
            res.status(200).jsonp({
                status: 200,
                data: user,
                error: {},
            });
            return;
        } else {
            console.log('could not find user')
            res.status(400).jsonp({
                status: 400,
                data: {},
                error: {
                    msg: message.user_not_found,
                },
            });
            return;
        }
    });
}; /*End of getUser*/

/*Get getAllUsers */
exports.getAllUsers = function (req, res) {
    console.log("User Controller: entering getAllUsers")
    console.log('Request params :: ', req.params)
    console.log("request query :: ", req.query);

    RegisteredUsers.find(function (err, user) {
        if (err) {
            console.log('err in finding all user', err)
            res.status(500).jsonp({
                status: 500,
                data: {},
                error: {
                    msg: message.something_went_wrong,
                    err: err,
                },
            });
            return;
        }
        console.log('user response', user)
        res.status(200).jsonp({
            status: 200,
            data: user,
            error: {},
        });
        return;
    });
}; /*End of getAllUsers*/
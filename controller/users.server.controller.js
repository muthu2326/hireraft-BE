var waterfall = require('async-waterfall');
var utility = require('../service/utils')
const message = require("../service/message.json");
var dbHelper = require('../service/db_helper')
const fs = require('fs')
const csv = require('fast-csv');
const { Parser } = require('json2csv');

const RegisteredUsers = require('../models/RegisteredUsersSchema');
const UsersAndJobsApplied = require('../models/UsersAndJobsAppliedSchema');
const NaukriPostedJob = require('../models/NaukriPostedJobSchema');
const Survey = require('../models/SurveySchema');

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
        _id: req.body.uuid,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        course: req.body.course,
        passing_year: req.body.passing_year,
        skills: req.body.skills,
        joining_by: req.body.joining_by,
        subscribe: req.body.subscribe ? req.body.subscribe : false
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
        dbHelper.sendEmailToHrAfterReg(response, (err, mail_res) => {
            console.log('email call back response', mail_res)
            response.msg = "Successfully Registered"
            console.log('Exiting userRegistration')
            res.send({
                status: 200,
                data: response,
                err: {}
            })
            return;
        })
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

/*Get a single user */
exports.getUserCMSJobs = function (req, res) {
    console.log("User Controller: entering getUserJobs")
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
    UsersAndJobsApplied.find({
        user_id: user_id,
        job_type: 'cms'
    }, {
        _id: 0,
        job_id: 1
    }, function (err, jobs_applied) {
        if (err) {
            console.log('err in finding getUserJobs', err)
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
        console.log('getUserJobs response', jobs_applied.length)
        res.send({
            status: 200,
            data: {
                jobs: jobs_applied.map((j) => j.job_id)
            },
            err: {}
        })
        return;
    })
}

/*Get a single user */
exports.getUserJobs = function (req, res) {
    console.log("User Controller: entering getUserJobs")
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
    const page = req.query.page
    const limit = req.query.limit
    const sort = req.query.sort

    console.log('page', page, 'limit', limit)
    let pagination = {}

    if (page != null && limit != null) {
        pagination.limit = limit * 1
        pagination.skip = ((page - 1) * limit)
    }

    if (sort) {
        pagination.sort = {
            "created": sort
        }
    }

    console.log('pagination', pagination)

    UsersAndJobsApplied.find({
        user_id: user_id,
        job_type: { $ne: 'cms' }
    }, {
        _id: 0,
        job_id: 1,
        status: 1
    }, function (err, jobs_applied) {
        if (err) {
            console.log('err in finding getUserJobs', err)
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
        console.log('getUserJobs response', jobs_applied.length)
        if (jobs_applied.length > 0) {
            job_ids = []
            jobs_applied.forEach(jobs => {
                if (!job_ids.includes(jobs.job_id)) {
                    job_ids.push(jobs.job_id)
                }
            });

            console.log('job_ids', job_ids)
            NaukriPostedJob.find({
                _id: {
                    "$in": job_ids
                }
            }, {
                _id: 1,
                company_name: 1,
                company_address: 1,
                employment_type: 1,
                raw_experience_required: 1,
                raw_salary_package: 1,
                skills_required: 1,
                date: 1,
                role: 1
            }, pagination, function (err, docs) {
                console.log('docs', docs.length)
                if (err) {
                    console.log('err in getJobsCount', err)
                    res.send({
                        status: 500,
                        data: {},
                        err: {
                            msg: message.something_went_wrong,
                            err: err
                        }
                    })
                    return;
                } else {
                    res.send({
                        status: 200,
                        data: {
                            total: jobs_applied.length,
                            results_count: docs.length,
                            docs
                        },
                        err: {}
                    })
                    return;
                }
            })
        } else {
            res.send({
                status: 200,
                data: {
                    jobs: []
                },
                err: {}
            })
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

exports.generateHashForEmails = function (req, res) {
    console.log('User Controller: entering generateHashForEmails');
    let NOW = new Date()
    console.log('req.file', req.file)

    if (!req.file) {
        res.status(400).jsonp({
            status: 400,
            data: {},
            error: {
                msg: message.invalid_get_request
            }
        });
        return;
    }
    req.query.type = 'user'
    dbHelper.hashEmails(req, res)
}

exports.decryptUserData = function (req, res) {
    console.log("User Controller: entering decryptUserData")
    console.log('Request params :: ', req.params)
    console.log("request query :: ", req.query);

    if (!req.params.encrypt_id) {
        console.log("missing encrypt_id in params");
        res.status(400).jsonp({
            status: 400,
            data: {},
            message: message.invalid_get_request,
        });
        return;
    }

    let encrypt_id = req.params.encrypt_id
    console.log('encrypt_id', encrypt_id)
    email = dbHelper.decrypt(encrypt_id)
    res.status(200).jsonp({
        status: 200,
        data: {
            email: email
        },
        error: {},
    });
    return;
}

exports.postSurvey = (req, res) => {
    console.log("User Controller: entering postSurvey")
    console.log('Request body :: ', req.body)
    console.log("request query :: ", req.query);   

    if (!req.body.encrypt_id || !req.body.question || !req.body.answers) {
        console.log("missing mandat fields");
        res.status(400).jsonp({
            status: 400,
            data: {},
            message: message.missing_fields,
        });
        return;
    }

    req.body.type = req.body.type ? req.body.type : 'candidate'
    dbHelper.postSurvey(req, res)
}

exports.getSurveyByEncryptedId = (req, res) => {
    console.log("User Controller: entering getSurveyByEncryptedId")
    console.log('Request params :: ', req.params)
    console.log("request query :: ", req.query);   

    if (!req.params.encrypt_id) {
        console.log("missing encrypt_id in params");
        res.status(400).jsonp({
            status: 400,
            data: {},
            message: message.invalid_get_request,
        });
        return;
    }

    req.query.type = req.query.type ? req.query.type : 'candidate'
    dbHelper.fetchSurvey(req, res)
}
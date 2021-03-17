var waterfall = require('async-waterfall');
var utility = require('../service/utils')
const message = require("../service/message.json");

const RegisteredUsers = require('../models/RegisteredUsersSchema');
const UsersAndJobsApplied = require('../models/UsersAndJobsAppliedSchema');
const NaukriPostedJob = require('../models/NaukriPostedJobSchema');

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

    if(page != null && limit != null){
        pagination.limit = limit * 1
        pagination.skip = ((page - 1) * limit)
    }

    if(sort){
        pagination.sort = { "created" : sort }
    }

    console.log('pagination', pagination)

    UsersAndJobsApplied.find({user_id: user_id}, {_id: 0, job_id: 1, status: 1}, function (err, jobs_applied) {
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
                if(!job_ids.includes(jobs.job_id)){
                    job_ids.push(jobs.job_id)
                }
            });

            console.log('job_ids', job_ids)
            NaukriPostedJob.find({ _id: {"$in": job_ids}}, 
            {
                _id: 1,
                company_name: 1,
                company_address: 1,
                employment_type: 1,
                raw_experience_required: 1,
                raw_salary_package: 1,
                date: 1,
                role: 1
            }, pagination
            ,function(err, docs) {
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
        }else{
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
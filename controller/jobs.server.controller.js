var waterfall = require('async-waterfall');
var utility = require('../service/utils')
var dbHelper = require('../service/db_helper')
var nodemailer = require('nodemailer');
const config = require('config');

const NaukriPostedJob = require('../models/NaukriPostedJobSchema');
const UsersAndJobsApplied = require('../models/UsersAndJobsAppliedSchema');

exports.getjob = function (req, res) {

    var check = utility.checkRequestBody(req.body)
    if (check.error) {
        res.status(400).send(check.message)
    }

    condition = utility.getFilterCondition(req.body.filter)
    const page = req.query.page
    const limit = req.query.limit
    const sort = req.query.sort
    const user_id = req.query.uuid ? req.query.uuid : null

    console.log('page', page, 'limit', limit)
    let pagination = {}

    if (page != null && limit != null) {
        pagination.limit = limit * 1
        pagination.skip = ((page - 1) * limit)
    }

    if (sort) {
        pagination.sort = {
            "date": sort
        }
    }

    console.log('condition', condition)
    console.log('pagination', pagination)
    NaukriPostedJob.find(condition, {
            _id: 1,
            company_name: 1,
            company_address: 1,
            employment_type: 1,
            raw_experience_required: 1,
            raw_salary_package: 1,
            raw_skills_required: 1,
            date: 1,
            role: 1
        }, pagination,
        function (err, docs) {
            if (err) {
                console.log('err', err)
                res.send(err)
            } else {
                NaukriPostedJob.find(condition, {
                    _id: 1
                }, (err, response) => {
                    console.log('response', response.length)
                    if (err) {
                        console.log('err in getting response', err)
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
                        if (user_id != null) {
                            dbHelper.getJobsStatusForUser(user_id, docs, (err, jobs_res) => {
                                if (err) {
                                    res.status(err.status).send(jobs_res)
                                    return;
                                } else {
                                    filter = docs.filter((job) => {
                                        if(job.company_address != null && job.role != null && job.employment_type != null){
                                            return job
                                        }
                                    })
                                    res.send({
                                        total: response.length,
                                        results_count: filter.length,
                                        docs: filter
                                    })
                                }
                            })
                        } else {
                            filter = docs.filter((job) => {
                                if(job.company_address != null && job.role != null && job.employment_type != null){
                                    return job
                                }
                            })
                            res.send({
                                total: response.length,
                                results_count: filter.length,
                                docs: filter
                            })
                        }
                    }
                })
            }
        })
}

exports.getJobById = function (req, res) {
    console.log("Job Controller: entering getJobById")
    console.log('Request params :: ', req.params)
    console.log("request query :: ", req.query);

    /*Validate for a null id*/
    if (!req.params.job_id) {
        console.log("missing job_id in params");
        res.status(400).jsonp({
            status: 400,
            data: {},
            message: message.invalid_get_request,
        });
        return;
    }

    var job_id = req.params.job_id;
    var user_id = req.query.uuid ? req.query.uuid : null;

    NaukriPostedJob.findById(job_id, function (err, job) {
        if (err) {
            console.log('err in finding job', err)
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
        console.log('job response', job)
        if (job) {
            if (user_id != null) {
                UsersAndJobsApplied.findOne({
                        user_id: user_id,
                        job_id: job_id
                    }, {
                        _id: 0,
                        job_id: 1,
                        status: 1
                    },
                    function (err, job_applied) {
                        if (err) {
                            console.log('err in finding job', err)
                            res.status(500).jsonp({
                                status: 500,
                                data: {},
                                error: {
                                    msg: message.something_went_wrong,
                                    err: err,
                                },
                            });
                            return;
                        } else {
                            let job_data = {
                                ...job["_doc"]
                            }
                            if (job_applied) {
                                job_data.applied_status = true
                            } else {
                                job_data.applied_status = false
                            }
                            res.status(200).jsonp({
                                status: 200,
                                data: job_data,
                                error: {},
                            });
                            return;
                        }
                    })
            } else {
                res.status(200).jsonp({
                    status: 200,
                    data: job,
                    error: {},
                });
                return;
            }
        } else {
            console.log('could not find job')
            res.status(400).jsonp({
                status: 400,
                data: {},
                error: {
                    msg: message.job_not_found,
                },
            });
            return;
        }
    });
};

exports.applyJobNew = function (req, res) {
    console.log("Jobs Controller: entering applyJob")
    console.log('Request params :: ', req.params)
    console.log("request query :: ", req.query);

    if (!req.body.email || !req.body.uuid || !req.body.job_id) {
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
    let user_id = req.body.uuid
    let email = req.body.email
    let job_id = req.body.job_id

    dbHelper.findUser(user_id, email, (err, ch_user) => {
        if (err) {
            res.status(err.status).jsonp(err);
            return;
        } else {
            if (!ch_user) {
                console.log('New User')
                dbHelper.registerUser(req, (err, new_user) => {
                    if (err) {
                        res.status(err.status).jsonp(err);
                        return;
                    }
                    if (new_user) {
                        let new_user_id = new_user._id;
                        dbHelper.FindJobDetails(job_id, (err, job) => {
                            if (err) {
                                res.status(err.status).jsonp(err);
                                return;
                            }
                            if (job) {
                                dbHelper.applyForJob(req, new_user, job, (err, response) => {
                                    if (err) {
                                        res.status(err.status).jsonp(err);
                                        return;
                                    } else {
                                        res.send({
                                            status: 200,
                                            data: {
                                                reference: response._id,
                                                msg: "Successfully Applied"
                                            },
                                            err: {}
                                        })
                                        return;
                                    }
                                })
                            }
                        })
                    }
                })
            } else {
                console.log('user already registered')
                dbHelper.FindJobDetails(job_id, (err, job) => {
                    if (err) {
                        res.status(err.status).jsonp(err);
                        return;
                    }
                    if (job) {
                        dbHelper.checkIfUserAppliedForSameJob(user_id, job_id, (err, duplicateJob) => {
                            if (err) {
                                res.status(err.status).jsonp(err);
                                return;
                            } else {
                                if (!duplicateJob) {
                                    dbHelper.applyForJob(req, ch_user, job, (err, response) => {
                                        if (err) {
                                            res.status(err.status).jsonp(err);
                                            return;
                                        } else {
                                            res.send({
                                                status: 200,
                                                data: {
                                                    reference: response._id,
                                                    msg: "Successfully Applied"
                                                },
                                                err: {}
                                            })
                                            return;
                                        }
                                    })
                                }
                            }
                        })
                    }
                })
            }
        }
    })
}

exports.getJobsCount = function (req, res) {
    console.log("Jobs Controller: entering getJobsCount")
    console.log('Request params :: ', req.params)
    console.log("request query :: ", req.query);

    NaukriPostedJob.find(function (err, docs) {
        console.log('docs', docs)
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
            filter = docs.filter((job) => {
                if(job.company_address != null && job.role != null && job.employment_type != null){
                    return job
                }
            })
            res.send({
                status: 200,
                data: {
                    jobs_count: filter.length
                },
                err: {}
            })
            return;
        }
    })
}
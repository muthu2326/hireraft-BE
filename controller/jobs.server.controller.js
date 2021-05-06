var waterfall = require('async-waterfall');
var utility = require('../service/utils')
var dbHelper = require('../service/db_helper')
var nodemailer = require('nodemailer');
const config = require('config');
const message = require("../service/message.json");
const fs = require('fs')
const csv = require('fast-csv');
const {
    Parser
} = require('json2csv');

const NaukriPostedJob = require('../models/NaukriPostedJobSchema');
const UsersAndJobsApplied = require('../models/UsersAndJobsAppliedSchema');

exports.createJob = (req, res) => {
    console.log("Job Controller: entering createJob")
    console.log('Request body :: ', req.body)
    console.log("request query :: ", req.query);

    let jobRequest = {
        technology: req.body.technology ? req.body.technology : null,
        company_name: req.body.company_name ? req.body.company_name : null,
        company_address: req.body.company_address ? req.body.company_address : null,
        company_website: req.body.company_website ? req.body.company_website : null,
        email: req.body.email ? req.body.email : null,
        phone: req.body.phone ? req.body.phone : null,
        company_contact_person: req.body.company_contact_person ? req.body.company_contact_person : null,
        company_contact_person_role: req.body.company_contact_person_role ? req.body.company_contact_person_role : null,
        raw_job_description: req.body.raw_job_description ? req.body.raw_job_description : null,
        job_description: req.body.job_description ? req.body.job_description : null,
        raw_skills_required: req.body.raw_skills_required ? req.body.raw_skills_required : null,
        skills_required: req.body.skills_required ? req.body.skills_required : [],
        raw_salary_package: req.body.raw_salary_package ? req.body.raw_salary_package : null,
        raw_experience_required: req.body.raw_experience_required ? req.body.raw_experience_required : null,
        raw_qualifications: req.body.raw_qualifications ? req.body.raw_qualifications : null,
        qualifications: req.body.qualifications ? req.body.qualifications : [],
        role: req.body.role ? req.body.role : null,
        industry_type: req.body.industry_type ? req.body.industry_type : null,
        functional_area: req.body.functional_area ? req.body.functional_area : null,
        employment_type: req.body.employment_type ? req.body.employment_type : null,
        role_category: req.body.role_category ? req.body.role_category : null,
        notice_period: req.body.notice_period ? req.body.notice_period : null,
        job_post_datetime: req.body.job_post_datetime ? req.body.job_post_datetime : 'Today',
        url: req.body.url ? req.body.url : null,
        salary_min: req.body.salary_min ? req.body.salary_min : null,
        salary_max: req.body.salary_max ? req.body.salary_max : null,
        experience_min: req.body.experience_min ? req.body.experience_min : null,
        experience_max: req.body.experience_max ? req.body.experience_max : null,
        recommandations: req.body.recommandations ? req.body.recommandations : [],
    }

    let job = new NaukriPostedJob(jobRequest)
    job.save((err, jobResponse) => {
        if (err) {
            console.log('err in create job', err)
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
            console.log('created new jobResponse', jobResponse)
            res.status(200).jsonp({
                status: 200,
                data: {
                    msg: message.success
                },
                error: {},
            });
            return;
        }
    })
}

exports.editJob = (req, res) => {
    console.log("Job Controller: entering editJob")
    console.log('Request params:: ', req.params)
    console.log('Request body:: ', req.body)
    console.log("request query :: ", req.query);

    if (!req.params.job_id) {
        console.log("missing job_id in params");
        res.status(400).jsonp({
            status: 400,
            data: {},
            err: {
                msg: message.invalid_get_request,
            }
        });
        return;
    }

    var job_id = req.params.job_id;

    NaukriPostedJob.findById(job_id, (err, job) => {
        if (err) {
            console.log('err in create job', err)
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
            console.log('found job')
            if (job) {
                let jobRequest = {
                    technology: req.body.technology ? req.body.technology : job.technology,
                    company_name: req.body.company_name ? req.body.company_name : job.company_name,
                    company_address: req.body.company_address ? req.body.company_address : job.company_address,
                    company_website: req.body.company_website ? req.body.company_website : job.company_website,
                    email: req.body.email ? req.body.email : job.email,
                    phone: req.body.phone ? req.body.phone : job.phone,
                    company_contact_person: req.body.company_contact_person ? req.body.company_contact_person : job.company_contact_person,
                    company_contact_person_role: req.body.company_contact_person_role ? req.body.company_contact_person_role : job.company_contact_person_role,
                    raw_job_description: req.body.raw_job_description ? req.body.raw_job_description : job.raw_job_description,
                    job_description: req.body.job_description ? req.body.job_description : job.job_description,
                    raw_skills_required: req.body.raw_skills_required ? req.body.raw_skills_required : job.raw_skills_required,
                    skills_required: req.body.skills_required ? req.body.skills_required : job.skills_required,
                    raw_salary_package: req.body.raw_salary_package ? req.body.raw_salary_package : job.raw_salary_package,
                    raw_experience_required: req.body.raw_experience_required ? req.body.raw_experience_required : job.raw_experience_required,
                    raw_qualifications: req.body.raw_qualifications ? req.body.raw_qualifications : job.raw_qualifications,
                    qualifications: req.body.qualifications ? req.body.qualifications : job.qualifications,
                    role: req.body.role ? req.body.role : job.role,
                    industry_type: req.body.industry_type ? req.body.industry_type : job.industry_type,
                    functional_area: req.body.functional_area ? req.body.functional_area : job.functional_area,
                    employment_type: req.body.employment_type ? req.body.employment_type : job.employment_type,
                    role_category: req.body.role_category ? req.body.role_category : job.role_category,
                    notice_period: req.body.notice_period ? req.body.notice_period : job.notice_period,
                    job_post_datetime: req.body.job_post_datetime ? req.body.job_post_datetime : job.job_post_datetime,
                    url: req.body.url ? req.body.url : job.url,
                    salary_min: req.body.salary_min ? req.body.salary_min : job.salary_min,
                    salary_max: req.body.salary_max ? req.body.salary_max : job.salary_max,
                    experience_min: req.body.experience_min ? req.body.experience_min : job.experience_min,
                    experience_max: req.body.experience_max ? req.body.experience_max : job.experience_max,
                    recommandations: req.body.recommandations ? req.body.recommandations : job.recommandations,
                    updated: new Date()
                }

                NaukriPostedJob.updateOne({
                    _id: job_id
                }, jobRequest, (err, updatedRes) => {
                    console.log('updated job response', updatedRes)
                    if (err) {
                        console.log('err in edit job', err)
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
                        res.status(200).jsonp({
                            status: 200,
                            data: {
                                msg: message.success
                            },
                            error: {},
                        });
                        return;
                    }
                })
            } else {
                res.status(400).jsonp({
                    status: 400,
                    data: {},
                    err: {
                        msg: message.job_not_found,
                    }
                });
                return;
            }
        }
    })
}

exports.removeJob = (req, res) => {
    console.log("Job Controller: entering removeJob")
    console.log('Request body :: ', req.params)
    console.log("request query :: ", req.query);

    if (!req.params.job_id) {
        console.log("missing job_id in params");
        res.status(400).jsonp({
            status: 400,
            data: {},
            err: {
                msg: message.invalid_get_request,
            }
        });
        return;
    }

    var job_id = req.params.job_id;

    NaukriPostedJob.deleteOne({
        _id: job_id
    }, (err, response) => {
        if (err) {
            console.log('err in edit job', err)
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
            if (response) {
                res.status(200).jsonp({
                    status: 200,
                    data: {
                        msg: message.success
                    },
                    error: {},
                });
                return;
            } else {
                res.status(400).jsonp({
                    status: 400,
                    data: {},
                    err: {
                        msg: message.job_not_found,
                    }
                });
                return;
            }
        }
    })
}

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
            skills_required: 1,
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
                                    res.status(err.status).send(err)
                                    return;
                                } else {
                                    res.send({
                                        total: response.length,
                                        results_count: jobs_res.length,
                                        docs: jobs_res
                                    })
                                }
                            })
                        } else {
                            res.send({
                                total: response.length,
                                results_count: docs.length,
                                docs: docs
                            })
                        }
                    }
                })
            }
        })
}

exports.getRecommendedJobs = (req, res) => {
    console.log("Job Controller: entering getRecommendedJobs")
    console.log('Request params :: ', req.params)
    console.log("request query :: ", req.query);

    let condition = {}
    let recommendations = req.query.tech ? req.query.tech : []
    const user_id = req.query.uuid ? req.query.uuid : null
    let rec = null

    if (recommendations.includes(',')) {
        rec = recommendations.split(',')
    } else {
        rec = [recommendations]
    }

    skills = []
    rec.forEach((skill) => {
        let obj = {
            "recommandations": {
                $regex: skill,
                $options: 'i'
            }
        }
        skills.push(obj)
    })

    condition["$or"] = skills
    console.log('condition', JSON.stringify(condition))

    NaukriPostedJob.find(condition, {
            _id: 1,
            company_name: 1,
            company_address: 1,
            employment_type: 1,
            raw_experience_required: 1,
            raw_salary_package: 1,
            skills_required: 1,
            date: 1,
            role: 1
        }, {
            sort: {
                'date': '-1'
            }
        },
        function (err, docs) {
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
            if (user_id != null) {
                dbHelper.getJobsStatusForUser(user_id, docs, (err, jobs_res) => {
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
                        res.status(200).jsonp({
                            status: 200,
                            data: {
                                count: jobs_res.length,
                                jobs: jobs_res
                            },
                            error: {},
                        });
                        return;
                    }
                })
            } else {
                res.status(200).jsonp({
                    status: 200,
                    data: {
                        count: docs.length,
                        jobs: docs
                    },
                    error: {},
                });
                return;
            }
        })
}

exports.updateJobsRecommendations = (req, res) => {
    console.log("Job Controller: entering updateJobsRecommendations")
    console.log('Request body :: ', req.body)
    console.log("request query :: ", req.query);

    let jobs_ids = req.body.jobs ? req.body.jobs : []
    let skills = req.body.skills ? req.body.skills : []

    console.log('skills', skills)

    if (jobs_ids.length > 0) {
        let jobs = {
            _id: {
                $in: jobs_ids
            }
        }

        let recommandation = {
            recommandations: skills.map((r) => r.toLowerCase().trim())
        }

        NaukriPostedJob.updateMany(jobs, recommandation,
            (err, updatedRes) => {
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
                console.log('updatedRes', updatedRes)
                res.status(200).jsonp({
                    status: 200,
                    data: {
                        msg: "Success"
                    },
                    error: {},
                });
                return;
            })
    } else {
        res.status(400).jsonp({
            status: 400,
            data: {},
            error: {
                msg: "No Jobs to update"
            },
        });
        return;
    }
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
            err: {
                msg: message.invalid_get_request,
            }
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

    if (!req.body.email || !req.body.uuid || !req.body.job_id || !req.body.job_url) {
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
    let job_url = req.body.job_url

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
                                dbHelper.applyForJob(req, new_user, job, job_url, (err, response) => {
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
                                    dbHelper.applyForJob(req, ch_user, job, job_url, (err, response) => {
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
    let condition = {
        company_address: {
            '$ne': null
        },
        role: {
            '$ne': null
        },
        employment_type: {
            '$ne': null
        }
    }
    NaukriPostedJob.find(condition, function (err, docs) {
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
                    jobs_count: docs.length
                },
                err: {}
            })
            return;
        }
    })
}

exports.getJobContactPersionDetails = (req, res) => {
    console.log("Jobs Controller: entering getJobContactPersionDetails")
    console.log('Request params :: ', req.params)
    console.log("request query :: ", req.query);

    NaukriPostedJob.find((err, jobs) => {
        if (err) {
            console.log('err in getJobContactPersionDetails', err)
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
        if (jobs.length > 0) {
            let jobs_format = jobs.map((j) => {
                return {
                    CompnayName: j.company_name ? j.company_name.trim() : null,
                    Person: j.company_contact_person ? j.company_contact_person.trim() : null,
                    Role: j.company_contact_person_role ? j.company_contact_person_role.trim() : null
                }
            })
            const csvFields = ['CompnayName', 'Person', 'Role'];
            console.log('jobs', jobs_format.length)
            const json2csvParser = new Parser({
                csvFields
            });
            const csvData = json2csvParser.parse(jobs_format);
            res.setHeader('Content-disposition', 'attachment; filename=users.csv');
            res.set('Content-Type', 'text/csv');
            res.attachment('recruiter_details.csv');
            res.send(csvData);
        } else {
            res.status(400).jsonp({
                status: 400,
                data: {},
                error: {
                    msg: `No Jobs found`
                }
            });
            return;
        }
    })
}
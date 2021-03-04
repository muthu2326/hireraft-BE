var waterfall = require('async-waterfall');
var utility = require('../service/utils')
var nodemailer = require('nodemailer');

const NaukriPostedJob = require('../models/NaukriPostedJobSchema');
const UsersAndJobsApplied = require('../models/UsersAndJobsAppliedSchema');

exports.getjob = function(req, res) {

    var check = utility.checkRequestBody(req.body)
    if (check.error) {
        res.status(400).send(check.message)
    }

    condition = utility.getFilterCondition(req.body.filter)
    NaukriPostedJob.find(condition, {_id: 1, company_name: 1, company_address: 1, employment_type: 1, role: 1},
        function(err, docs) {
            if (err) {
                res.send(err)
            } else {
                res.send({
                    total:docs.length,
                    docs
                })
            }
        })
}

exports.applyJob = function (req, res) {
    console.log("Jobs Controller: entering applyJob")
    console.log('Request params :: ', req.params)
    console.log("request query :: ", req.query);

    if (!req.body.email || !req.body.name || !req.body.phone || !req.body.uuid, !req.body.job_id) {
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

    let applyjob_request = {
        user_id: req.body.uuid,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        job_id: req.body.job_id,
        status: "Applied"
    }

    UsersAndJobsApplied.findOne({user_id: req.body.uuid, job_id: req.body.job_id}, 
        (err, user) => {
        console.log('user already applied', user)
        if(err){
            console.log('err in apply for jobs', err)
            console.log('Exiting applyJob from Jobs apply')
            res.send({
                status: 500,
                data: {},
                err: {
                    msg: message.something_went_wrong,
                    err: err
                }
            })
            return;
        }else{
            if(!user){
                jobs_applied = new UsersAndJobsApplied(applyjob_request)
                jobs_applied.save((err, jobs_response) => {
                    if (err) {
                        console.log('err in apply for jobs', err)
                        console.log('Exiting applyJob from Jobs apply')
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
                    sendEmail('hai')
                    console.log('jobs_response', jobs_response)
                    console.log('Exiting applyJob')
                    res.send({
                        status: 200,
                        data: {
                            reference: jobs_response._id,
                            msg: "Successfully Applied"
                        },
                        err: {}
                    })
                    return;
                })
            }else{
                res.send({
                    status: 400,
                    data: {},
                    err: {
                        msg: "Already applied"
                    }
                })
                return;
            }
        }
    })
}

exports.getJobsCount = function(req, res) {
    console.log("Jobs Controller: entering getJobsCount")
    console.log('Request params :: ', req.params)
    console.log("request query :: ", req.query);
    
    NaukriPostedJob.count(function(err, docs) {
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
                res.send({
                    status: 200,
                    data: {
                        jobs_count: docs  
                    },
                    err: {}
                })
                return;
            }
        })
}

sendEmail = (data) => {
    console.log('Test Send Email', data)
    var transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, 
        auth: {
               user: 'cement.itservices@prismjohnson.in',
               pass: 'PjlCement@2018('
           }
       });

       const mailOptions = {
        from: 'muthu.r@digiapt.com', // sender address
        to: 'jayaram.reddy@gmail.com', // list of receivers
        subject: 'Subject of your email', // Subject line
        html: '<p>Test Email</p>'// plain text body
      };

      transporter.sendMail(mailOptions, function (err, info) {
        if(err)
          console.log(err)
        else
          console.log(info);
     });
     
}
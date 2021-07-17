var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
const config = require('config');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const password = 'd6F3Efeq';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
const fs = require('fs')
const csv = require('fast-csv');
const {
    Parser
} = require('json2csv');
const {
    v4: uuidv4
} = require('uuid');

const message = require("./message.json");
const RegisteredUsers = require('../models/RegisteredUsersSchema');
const NaukriPostedJob = require('../models/NaukriPostedJobSchema');
const UsersAndJobsApplied = require('../models/UsersAndJobsAppliedSchema');
const Employer = require('../models/EmployerSchema');
const Session = require('../models/SessionSchema');
const Survey = require('../models/SurveySchema');

exports.findUser = function (user_id, email, cb) {

    RegisteredUsers.findById({
        _id: user_id
    }, function (err, user) {
        if (err) {
            console.log('err in findUser', err)
            let err_res = {
                status: 500,
                data: {},
                err: {
                    msg: message.something_went_wrong,
                    err: err
                }
            }
            cb(err_res, null)
            return;
        }
        console.log('user response', user)
        if (user) {
            cb(null, user)
            return;
        } else {
            console.log('could not find user')
            cb(null, null)
            return;
        }
    });
};

exports.registerUser = function (req, cb) {
    console.log('Entering registerUser')
    console.log('Request Body :: ', req.body)
    console.log('Request params :: ', req.params)
    console.log("request query :: ", req.query);

    if (!req.body.email || !req.body.name || !req.body.phone || !req.body.course || !req.body.skills || !req.body.passing_year || !req.body.joining_by) {
        let err = {
            status: 400,
            data: {},
            error: {
                msg: message.missing_fields,
            },
        };
        cb(err, null)
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
            console.log('Exiting registerUser')
            let err_res = {
                status: 500,
                data: {},
                err: {
                    msg: message.something_went_wrong,
                    err: err
                }
            }
            cb(err_res, null)
            return;
        }
        console.log('Exiting registerUser')
        cb(null, response)
        return;
    })
}

exports.checkIfUserAppliedForSameJob = function (user_id, job_id, cb) {
    UsersAndJobsApplied.findOne({
            user_id: user_id,
            job_id: job_id
        },
        (err, job) => {
            console.log('checkIfUserAppliedForSameJob response', job)
            if (err) {
                console.log('err in apply for jobs', err)
                console.log('Exiting applyForJob from Jobs apply')
                let err_res = {
                    status: 500,
                    data: {},
                    err: {
                        msg: message.something_went_wrong,
                        err: err
                    }
                }
                cb(err_res, null)
                return;
            } else {
                if (job) {
                    console.log('user already applied')
                    let err_res = {
                        status: 400,
                        data: {},
                        err: {
                            msg: "Already applied"
                        }
                    }
                    cb(err_res, null)
                    return;
                } else {
                    console.log('user not applied')
                    cb(null, null)
                    return;
                }
            }
        })
}

exports.applyForJob = function (req, user, job, job_url, cb) {
    console.log('entering applyForJob')

    let applyForJob_request = {
        user_id: user._id,
        job_id: job._id,
        job_type: job.job_type ? job.job_type : 'db',
        status: "Applied"
    }

    jobs_applied = new UsersAndJobsApplied(applyForJob_request)
    jobs_applied.save((err, jobs_res) => {
        console.log('applied job response', jobs_res)
        if (err) {
            console.log('err in apply for jobs', err)
            console.log('Exiting applyForJob from Jobs apply')
            let err_res = {
                status: 500,
                data: {},
                err: {
                    msg: message.something_went_wrong,
                    err: err
                }
            }
            cb(err_res, null)
            return;
        } else {
            if (jobs_res) {
                sendEmailToHr(user, job, job_url, (err, email_res) => {
                    if (err) {
                        console.log('err in find Job Details', err)
                        let err_res = {
                            status: 500,
                            data: {},
                            err: {
                                msg: message.something_went_wrong,
                                err: err
                            }
                        }
                        cb(err_res, null)
                        return;
                    } else {
                        console.log('sent email to HR', email_res)
                        console.log('Applied for succesfully')
                        cb(null, jobs_res)
                    }
                })
            } else {
                let err_res2 = {
                    status: 500,
                    data: {},
                    err: {
                        msg: message.something_went_wrong
                    }
                }
                cb(err_res2, null)
                return;
            }
        }
    })
}

exports.applyForMultipleCMSJob = function (req, user, jobs, cb) {
    console.log('entering applyForMultipleCMSJob')

    let job_request = []

    jobs.forEach((j) => {
        let applyForJob_request = {
            user_id: user._id,
            job_id: j._id,
            job_type: j.job_type,
            status: "Applied"
        }
        job_request.push(new UsersAndJobsApplied(applyForJob_request))
    })

    if(job_request.length > 0){

        UsersAndJobsApplied.insertMany(job_request, (err, jobs_res) => {
            console.log('applied job response', jobs_res)
            if (err) {
                console.log('err in apply for jobs', err)
                console.log('Exiting applyForMultipleCMSJob from Jobs apply')
                let err_res = {
                    status: 500,
                    data: {},
                    err: {
                        msg: message.something_went_wrong,
                        err: err
                    }
                }
                cb(err_res, null)
                return;
            } else if (jobs_res) {
                if(jobs.length == jobs_res.length){
                    emailFormatForCMSJobs(user, jobs)
                    console.log('sent email to HR')
                    console.log('Applied jobs succesfully')
                    cb(null, jobs_res)   
                }else{
                    emailFormatForCMSJobs(user, jobs)
                    console.log('sent email to HR')
                    console.log('No Jobs Applied')
                    cb(null, jobs_res)
                }                
            }else {
                let err_res2 = {
                    status: 500,
                    data: {},
                    err: {
                        msg: message.something_went_wrong
                    }
                }
                cb(err_res2, null)
                return;
            }
        })                          
    }else{
        emailFormatForCMSJobs(user, jobs)
        console.log('sent email to HR')
        console.log('Applied jobs succesfully')
        cb(null, [])  
    }
}

var emailFormatForCMSJobs = exports.emailFormatForCMSJobs = (user, jobs) => {
    let tab = jobs.length > 0 ? `<br><br>${formatTableForAllJobs(jobs)}<br><br>` : "No Jobs Applied<br><br>"
    email_content = {
        subject: `${user.name} - Applied for CMS Jobs`,
        body: `<html><body>
        Hi,<br><br>A candidate has applied for ${jobs.length > 0 ? jobs.length : '0'} CMS jobs, Please find the details below<br><br>
        <b>Name:</b> ${user.name}<br>
        <b>Email:</b> ${user.email}<br>
        <b>Phone:</b> ${user.phone}<br>
        <b>Skills:</b> ${user.skills}<br>
        <b>Course:</b> ${user.course}<br>
        <b>Passing Year:</b> ${user.passing_year}<br>
        <b>Joining By:</b> ${user.joining_by}<br>
        <b>Subscribed:</b> ${user.subscribe ? 'Yes' : 'No'}<br><br> 
        <b>Job Details:</b> ${tab}                   
        Thanks & Regards,<br>
        <b>Hireraft<b>
        </body></html>`,
            from: config.get('from_email'),
            to: config.get('notify_to')
        }
    sendEmail(email_content)
}

var formatTableForAllJobs = exports.formatTableForAllJobs = (arr) => {
    console.log('arr', arr)
    let data = arr.map((d) => {
        return `<tr>
            <td style={text-align:'center'}>${d.company_name}</td>
            <td style={text-align:'center'}>${d.role}</td>
            <td style={text-align:'center'}><a href=${d.job_url}>Click here</a></td>
        </tr>`
    })
    let tab = `
    <table border='1'>
        <tr>
            <th>Company Name</th>
            <th>Role</th>
            <th>Job Page</th>
        </tr>
           ${data.join('')}
    </table>`

    return tab
}

exports.FindJobDetails = (job_id, cb) => {
    console.log('Entering FindJobDetails')
    console.log('job_id', job_id)

    NaukriPostedJob.findOne({
        _id: job_id
    }, {
        _id: 1,
        company_name: 1,
        company_address: 1,
        employment_type: 1,
        role: 1
    }, (err, docs) => {
        console.log('docs', docs)
        if (err) {
            console.log('err in find Job Details', err)
            let err_res = {
                status: 500,
                data: {},
                err: {
                    msg: message.something_went_wrong,
                    err: err
                }
            }
            cb(err_res, null)
            return;
        } else {
            if (docs) {
                cb(null, docs)
                return;
            } else {
                let err_res = {
                    status: 400,
                    data: {},
                    err: {
                        msg: "Could not find the Job"
                    }
                }
                cb(err_res, null)
                return;
            }
        }
    })
}

exports.sendEmailToHrAfterReg = (user, cb) => {
    console.log('entering sendEmailToHrAfterReg')
    email_content = {
        subject: `New User Registered - ${user.name}`,
        body: `<html><body>
    Hi,<br><br>A new user has been registered, Please find the details below<br><br>
    <b>Name:</b> ${user.name}<br>
    <b>Email:</b> ${user.email}<br>
    <b>Phone:</b> ${user.phone}<br>
    <b>Skills:</b> ${user.skills}<br>
    <b>Course:</b> ${user.course}<br>
    <b>Passing Year:</b> ${user.passing_year}<br>
    <b>Joining By:</b> ${user.joining_by}<br>
    <b>Subscribed:</b> ${user.subscribe ? 'Yes' : 'No'}<br><br>                      
    Thanks & Regards,<br>
    <b>Hireraft<b>
    </body></html>`,
        from: config.get('from_email'),
        to: config.get('notify_to')
    }
    sendEmail(email_content)
    cb(null, 'succesfully sent email to HR')
    return;
}

sendEmailToHr = (user, job, job_url, cb) => {
    if (user != null && job != null) {
        email_content = {
            subject: `${user.name} - Applied for a Job`,
            body: `<html><body>
        Hi,<br><br>A candidate has applied for a Job, Please find the details below<br><br>
        <b>Name:</b> ${user.name}<br>
        <b>Email:</b> ${user.email}<br>
        <b>Phone:</b> ${user.phone}<br>
        <b>Skills:</b> ${user.skills}<br>
        <b>Course:</b> ${user.course}<br>
        <b>Passing Year:</b> ${user.passing_year}<br>
        <b>Joining By:</b> ${user.joining_by}<br>
        <b>Subscribed:</b> ${user.subscribe ? 'Yes' : 'No'}<br><br> 
        <b>Company Name:</b> ${job.company_name}<br>
        <b>Company Address:</b> ${job.company_address}<br>
        <b>Job Details</b>: To view <a href=${job_url}>click here</a><br>
        <b>Role:</b> ${job.role}<br>
        <b>Employment Type:</b> ${job.employment_type}<br><br>                                    
        Thanks & Regards,<br>
        <b>Hireraft<b>
        </body></html>`,
            from: config.get('from_email'),
            to: config.get('notify_to')
        }
        sendEmail(email_content)
        cb(null, 'succesfully sent email to HR')
        return;
    } else {
        cb(null, 'could not send email to HR')
        return
    }
}

exports.sendEmployerDetailsToHr = (data, cb) => {
    console.log('entering sendEmplyerDetailsToHr')
    console.log('data', data)
    let tab = data.candidates.length > 0 ? `<br><br>${formatTableForArray(data.candidates)}<br><br>` : "No candidates shorlisted<br><br>"

    email_content = {
        subject: data.email ? `Employer - ${data.email} : shortlisted candidate` : `Employer - shortlisted candidate`,
        body: `<html><body>
    Hi,<br><br>${data.msg}<br><br>
    <b>Name:</b> ${data.name ? data.name : 'Not Available'}<br>
    <b>Email:</b> ${data.email ? data.email : 'Not Available'}<br>
    <b>Phone:</b> ${data.phone}<br>
    <b>Available for Contact:</b> ${data.can_contact ? 'Yes' : 'No'}<br>
    <b>Page Link:</b> <a href=${data.page_link}>Click here</a><br>
    <b>Candidates</b>: ${tab}
    Thanks & Regards,<br>
    <b>Hireraft<b>
    </body></html>`,
        from: config.get('from_email'),
        to: config.get('notify_to')
    }
    sendEmail(email_content)
    cb(null, 'succesfully sent email to HR')
    return;
}

exports.sendEmailToHrAfterEmployerClicksOnCampaignLink = (data, cb) => {
    console.log('entering sendEmailToHrAfterEmployerClicksOnCampaign')
    console.log('data', data)

    email_content = {
        subject: `Employer Clicked - ${data.status[0].toUpperCase() + data.status.slice(1, data.status.length).toLowerCase()} Link`,
        body: `<html><body>
    Hi,<br><br>${data.msg}<br><br>
    <b>Email:</b> ${data.email ? data.email : 'Not Available'}<br>
    <b>UUID:</b> ${data.uuid ? data.uuid : 'Not Available'}<br>
    <b>Page Link:</b> <a href=${data.page_link}>Click here</a><br>
    <b>Status:</b>  ${data.status[0].toUpperCase() + data.status.slice(1, data.status.length).toLowerCase()}<br>    
    <b>Date and Time: </b> ${data.clicked_on}<br><br>
    Thanks & Regards,<br>
    <b>Hireraft<b>
    </body></html>`,
        from: config.get('from_email'),
        to: config.get('notify_to')
    }
    sendEmail(email_content)
    cb(null, 'succesfully sent email to HR')
    return;
}

sendEmail = (data) => {
    console.log('Send Email', data)
    var transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        service: 'gmail',
        auth: {
            user: config.get('auth_email'),
            pass: config.get('auth_pass')
        }
    });

    const mailOptions = {
        from: data.from,
        to: data.to,
        subject: data.subject,
        html: data.body
    };

    transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            console.log(err)
        else
            console.log(info);
    });

}

exports.getJobsStatusForUser = function (user_id, jobs, cb) {
    console.log("DB Helper ::  entering getJobsStatusForUser")
    console.log('user_id', user_id)
    console.log('jobs recieved', jobs.length)
    UsersAndJobsApplied.find({
            user_id: user_id,
        }, {
            _id: 0,
            job_id: 1,
            status: 1
        },
        function (err, jobs_applied) {
            if (err) {
                console.log('err in finding getJobsStatusForUser', err)
                let err_res = {
                    status: 500,
                    data: {},
                    error: {
                        msg: message.something_went_wrong,
                        err: err,
                    },
                }
                cb(err_res, null)
                return;
            } else {
                let applied_jobs = jobs_applied.map(ap => {
                    return ap.job_id
                })
                console.log('applied_jobs', applied_jobs)
                if (jobs.length > 0) {
                    console.log('inside if ++++++')
                    let arr = jobs.map((jb) => {
                        let obj = {
                            ...jb["_doc"]
                        } // copying all the fields of document - value is stored under "_doc" property of mongoose response
                        obj.applied_status = false

                        if (applied_jobs.includes(String(jb._id))) {
                            obj.applied_status = true
                            return obj
                        } else {
                            return obj
                        }
                    })
                    cb(null, arr)
                    return;
                } else {
                    console.log('inside else ++++++')
                    cb(null, jobs)
                    return;
                }
            }
        });
}; /*End of getUser*/

var encrypt = exports.encrypt = (text) => {
    var cipher = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

var decrypt = exports.decrypt = (text) => {
    var decipher = crypto.createDecipher(algorithm, password)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}

exports.findEmployer = (encrypt_id, cb) => {
    console.log('Entering findEmployer')
    console.log('encrypt_id', encrypt_id)

    Employer.findOne({
        encrypt_id: encrypt_id
    }, (err, docs) => {
        console.log('docs', docs)
        if (err) {
            console.log('err in findEmployer', err)
            let err_res = {
                status: 500,
                data: {},
                err: {
                    msg: message.something_went_wrong,
                    err: err
                }
            }
            cb(err_res, null)
            return;
        } else {
            if (docs) {
                cb(null, docs)
                return;
            } {
                cb(null, null)
                return
            }
        }
    })
}

exports.hashEmails = (req, res) => {
    let data_list = []

    let csv_type = req.query.type ? req.query.type : 'employer'

    if (csv_type == 'user') {

        let NOW = new Date()
        let currentDatetime = new Date()
        let token = uuidv4(12);
        let expiry = currentDatetime.setDate(currentDatetime.getDate() + config.token_validity)

        let sessionRequest = {
            userId: null,
            email: null,
            role: "candidateCampaign",
            token: token,
            expiryDate: expiry
        }

        session = new Session(sessionRequest)
        session.save((err, sessionRes) => {
            if (err) {
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
            console.log('session response', sessionRes)
            fs.createReadStream(req.file.path)
                .pipe(csv.parse({
                    headers: true
                }))
                .on("data", function (data) {
                    let email = data['Email'];
                    console.log('email', email)

                    let obj = {
                        Fristname: data['Fristname'],
                        Email: data['Email'],
                        ID: encrypt(data['Email']),
                        Token: sessionRes.token
                    }
                    data_list.push(obj)
                })
                .on("end", function () {
                    fs.unlinkSync(req.file.path);
                    if (data_list.length > 0) {
                        const csvFields = ['Firstname', 'Email', 'ID', 'Token'];
                        console.log('data_list', data_list)
                        const json2csvParser = new Parser({
                            csvFields
                        });
                        const csvData = json2csvParser.parse(data_list);
                        res.setHeader('Content-disposition', 'attachment; filename=users.csv');
                        res.set('Content-Type', 'text/csv');
                        res.attachment('users.csv');
                        res.send(csvData);
                    } else {
                        res.status(400).jsonp({
                            status: 400,
                            data: {},
                            error: {
                                msg: `No Emails found from the file`
                            }
                        });
                        return;
                    }
                })
            })
    } else if (csv_type == 'employer') {
        let NOW = new Date()
        let currentDatetime = new Date()
        let token = uuidv4(12);
        let expiry = currentDatetime.setDate(currentDatetime.getDate() + config.token_validity)

        let sessionRequest = {
            userId: null,
            email: null,
            role: "employerCampign",
            token: token,
            expiryDate: expiry
        }

        session = new Session(sessionRequest)
        session.save((err, sessionRes) => {
            if (err) {
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
            console.log('session response', sessionRes)
            fs.createReadStream(req.file.path)
                .pipe(csv.parse({
                    headers: true
                }))
                .on("data", function (data) {
                    let email = data['Email'];
                    let obj = {
                        Company: data['Company'],
                        FirstName: data['FirstName'],
                        Email: data['Email'],
                        ID: encrypt(data['Email']),
                        Token: sessionRes.token
                    }
                    data_list.push(obj)
                })
                .on("end", function () {
                    fs.unlinkSync(req.file.path);
                    if (data_list.length > 0) {
                        const csvFields = ['Company', 'FirstName', 'Email', 'ID', 'Token'];
                        console.log('data_list', data_list.length)
                        const json2csvParser = new Parser({
                            csvFields
                        });
                        const csvData = json2csvParser.parse(data_list);
                        res.setHeader('Content-disposition', 'attachment; filename=employers.csv');
                        res.set('Content-Type', 'text/csv');
                        res.attachment('employers.csv');
                        res.send(csvData);
                    } else {
                        res.status(400).jsonp({
                            status: 400,
                            data: {},
                            error: {
                                msg: `No Emails found from the file`
                            }
                        });
                        return;
                    }
                })
        })
    }

}

var formatTableForArray = exports.formatTableForArray = (arr) => {
    console.log('arr', arr)
    let data = arr.map((d) => {
        return `<tr>
            <td style={text-align:'center'}>${d.id}</td>
            <td style={text-align:'center'}>${d.name}</td>
            <td style={text-align:'center'}><a href=${d.candidate_url}>Click here</a></td>
        </tr>`
    })
    let tab = `
    <table border='1'>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Candidate Page</th>
        </tr>
           ${data.join('')}
    </table>`

    return tab
}

exports.postSurvey = (req, res) => {
    console.log('entering :: postSurvey')

    let encrypt_id = req.body.encrypt_id
    let email = decrypt(encrypt_id)
    let type = req.body.type

    console.log('survey type', type)

    let surveyRequest = {
        encrypt_id: encrypt_id,
        type: req.body.type,
        email: email,
        questions: {
            question: req.body.question,
            answers: req.body.answers
        }
    }

    let survey = new Survey(surveyRequest)
    survey.save((err, response) => {
        if (err) {
            console.log('err in user postSurvey', err)
            console.log('Exiting postSurvey')
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
        console.log('survey response', response)
        res.send({
            status: 200,
            data: message.success,
            err: {}
        })
        return;
    })
}

exports.fetchSurvey = (req, res) => {
    console.log('entering :: fetchSurvey')

    let encrypt_id = req.params.encrypt_id
    let email = decrypt(encrypt_id)
    let type = req.query.type

    console.log('survey type', type)

    console.log('email', email)

    Survey.find({
        encrypt_id: encrypt_id,
        email: email,
        type: type,
    }, (err, response) => {
        if (err) {
            console.log('err in fetchSurvey', err)
            console.log('Exiting fetchSurvey')
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
        console.log('response length', response.length)

        let responseObj = {
            email: email,
            type: type,
            encrypt_id: encrypt_id,
            questions: []
        }

        if (response.length > 0) {
            response.forEach((q) => {
                console.log('q', q)
                responseObj.questions.push(q.questions)
            })
            res.send({
                status: 200,
                data: responseObj,
                err: {}
            })
            return;
        } else {
            res.send({
                status: 200,
                data: responseObj,
                err: {}
            })
            return;
        }
    })
}

exports.validateToken = (token, cb) => {
    console.log('Entering validateToken method')
    console.log('Token :: ', token)
    Session.findOne({
        token: token
    }, (err, sessionResponse) => {
        if (err) {
            console.log('err in dbHepler validateToken', err)
            console.log('Exiting validateToken')
            cb(err, null)
            return;
        }
        if (sessionResponse) {
            console.log('session found')
            let NOW = new Date()
            console.log('checking current time with token expiry time')
            console.log('NOW ', NOW, 'expiry date', sessionResponse.expiryDate)
            console.log('result :: ', NOW < sessionResponse.expiryDate)
            if (NOW < sessionResponse.expiryDate) {
                console.log('session is valid')
                console.log('session data', sessionResponse)
                cb(null, {
                    status: 200,
                    msg: 'Valid token',
                    expiryDate: sessionResponse.expiryDate
                })
                return;
            } else {
                if (sessionResponse.role == 'employerCampign') {
                    cb(null, {
                        status: 400,
                        msg: 'Token Expired',
                        expiryDate: sessionResponse.expiryDate
                    })
                    return;
                    return;
                } else {
                    cb(null, {
                        status: 401,
                        msg: 'Unauthorized Access',
                        expiryDate: null
                    })
                    return;
                }
            }
        } else {
            cb(null, {
                status: 403,
                msg: 'Forbidden Access',
                expiryDate: null
            })
            return;
        }
    })
}

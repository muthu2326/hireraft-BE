const message = require("../service/message.json");
var dbHelper = require('../service/db_helper')

const Employer = require('../models/EmployerSchema');

exports.storeEmployerAndCandidates = (req, res) => {
    console.log("Emplyer Controller: entering decryptEmployerData")
    console.log('Request body :: ', req.body)
    console.log("request query :: ", req.query);

    if (!req.params.encrypt_id || !req.body.candidates || !req.body.phone) {
        console.log("missing mandat fields");
        res.status(400).jsonp({
            status: 400,
            data: {},
            message: message.missing_fields,
        });
        return;
    }

    let encrypt_id = req.params.encrypt_id
    let encrypted_email = dbHelper.decrypt(encrypt_id)
    let email = req.body.email? req.body.email: null
    let name = req.body.name? req.body.name: null
    let phone = req.body.phone
    let candidates = req.body.candidates ? req.body.candidates : []

    console.log('encrypted_email', encrypted_email)

    if (!encrypted_email) {
        res.status(400).jsonp({
            status: 400,
            data: {},
            message: message.invalid_employer,
        });
        return;
    }

    dbHelper.findEmployer(encrypt_id, (err, employerResponse) => {
        if (err) {
            console.log('err in employer getShorlistedCandidates', err)
            console.log('Exiting getShorlistedCandidates')
            res.send(err)
            return;
        }
        if (employerResponse) {
            let empRequest = {
                email: email,
                name: name,
                phone: phone,
                candidates: candidates
            }

            Employer.updateOne({
                "_id": employerResponse._id
            }, empRequest, (err, updatedRes) => {
                if (err) {
                    console.log('err in employer getShorlistedCandidates', err)
                    console.log('Exiting getShorlistedCandidates')
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
                console.log('updated response', updatedRes)
                dbHelper.findEmployer(encrypt_id, (err, emp) => {
                    if (err) {
                        console.log('err in employer getShorlistedCandidates', err)
                        res.send(err)
                        return;
                    }
                    let email_data = {
                        name: emp.name,
                        email: emp.email,
                        phone: emp.phone,
                        candidates: emp.candidates.length > 0 ? emp.candidates : [],
                        msg: `An employer has updated his shorlisted candidates, Please find the details below`
                    }
                    dbHelper.sendEmployerDetailsToHr(email_data, (err, mail_res) => {
                        console.log('email call back response', mail_res)
                        res.send({
                            status: 200,
                            data: message.success,
                            err: {}
                        })
                        return;
                    })
                })              
            })
        } else {

            let empRequest = {
                encrypt_id: encrypt_id,
                name: name,
                email: email,
                phone: phone,
                candidates: candidates
            }

            let employer = new Employer(empRequest)
            employer.save((err, response) => {
                if (err) {
                    console.log('err in employer storeEmployerAndCandidates', err)
                    console.log('Exiting storeEmployerAndCandidates')
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
                console.log('employer response', response)

                let email_data = {
                    name: response.email,
                    email: response.email,
                    phone: response.phone,
                    candidates: response.candidates.length > 0 ? response.candidates : [],
                    msg: `An employer has shorlisted the candidates, Please find the details below`
                }

                dbHelper.sendEmployerDetailsToHr(email_data, (err, mail_res) => {
                    console.log('email call back response', mail_res)
                    res.send({
                        status: 200,
                        data: message.success,
                        err: {}
                    })
                    return;
                })
            })
        }
    })
}

exports.getShorlistedCandidates = (req, res) => {
    console.log("Employer Controller: entering getShorlistedCandidates")
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
    let email = dbHelper.decrypt(encrypt_id)

    console.log('email', email)

    Employer.findOne({
        encrypt_id: encrypt_id
    }, (err, response) => {
        if (err) {
            console.log('err in employer getShorlistedCandidates', err)
            console.log('Exiting getShorlistedCandidates')
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
        console.log('response', response)

        if(response){
            res.send({
                status: 200,
                data: response,
                err: {}
            })
            return;
        }else{
            res.send({
                status: 400,
                data: message.employer_not_found,
                err: {}
            })
            return;
        }
    })
}

exports.decryptEmployerData = (req, res) => {
    console.log("Emplyer Controller: entering decryptEmployerData")
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

exports.generateHashForEmails = function (req, res) {
    console.log('Employer Controller: entering generateHashForEmails');
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
    dbHelper.hashEmails(req, res)
}

exports.postEmployerSurvey = (req, res) => {
    console.log("Employer Controller: entering postEmployerSurvey")
    console.log('Request body :: ', req.body)
    console.log("request query :: ", req.query);   

    if (!req.body.encrypt_id || !req.body.question || !req.body.answers || !req.body.type) {
        console.log("missing mandat fields");
        res.status(400).jsonp({
            status: 400,
            data: {},
            message: message.missing_fields,
        });
        return;
    }

    dbHelper.postSurvey(req, res)
}

exports.getEmployerSurveyByEncryptedId = (req, res) => {
    console.log("User Controller: entering getEmployerSurveyByEncryptedId")
    console.log('Request params :: ', req.params)
    console.log("request query :: ", req.query);   

    if (!req.params.encrypt_id || req.query.type) {
        console.log("missing encrypt_id in params");
        res.status(400).jsonp({
            status: 400,
            data: {},
            message: message.invalid_get_request,
        });
        return;
    }

    req.query.type = req.query.type ? req.query.type : 'employer'
    dbHelper.fetchSurvey(req, res)

}
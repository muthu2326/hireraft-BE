const message = require("../service/message.json");
var dbHelper = require('../service/db_helper')

const Employer = require('../models/EmployerSchema');

exports.storeEmployerAndCandidates = (req, res) => {
    console.log("Emplyer Controller: entering decryptEmployerData")
    console.log('Request body :: ', req.body)
    console.log("request query :: ", req.query);

    if (!req.params.encrypt_id || !req.body.candidates || !req.body.email || !req.body.phone) {
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
    let email = req.body.email
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

    Employer.findOne({
        email: email,
        encrypt_id: encrypt_id
    }, (err, employerResponse) => {
        console.log('employerResponse', employerResponse)
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
        if (employerResponse) {
            let empRequest = {
                email: email,
                phone: phone,
                candidates: candidates
            }

            Employer.updateOne({
                "_id": employerResponse._id
            }, empRequest, {
                useFindAndModify: true
            }, (err, updatedRes) => {
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
                res.send({
                    status: 200,
                    data: message.success,
                    err: {}
                })
                return;
            })
        } else {

            let empRequest = {
                encrypt_id: encrypt_id,
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
                res.send({
                    status: 200,
                    data: message.success,
                    err: {}
                })
                return;
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
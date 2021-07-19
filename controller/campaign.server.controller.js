var waterfall = require('async-waterfall');
var utility = require('../service/utils')
var dbHelper = require('../service/db_helper')
var nodemailer = require('nodemailer');
const config = require('config');
var aggregatePaginate = require('mongoose-aggregate-paginate-v2');
var async = require("async");
const message = require("../service/message.json");

const NaukriPostedJob = require('../models/NaukriPostedJobSchema');
const UsersAndJobsApplied = require('../models/UsersAndJobsAppliedSchema');
const RegisteredUsers = require('../models/RegisteredUsersSchema');
const Survey = require('../models/SurveySchema');
const CampaignLogs = require('../models/CampaignLogsSchema');

exports.storeCampaignLog = (req, res) => {
    console.log('Entering storeCampaignLog')
    console.log('Request Body :: ', req.body)
    console.log('Request params :: ', req.params)
    console.log("request query :: ", req.query);

    if (!req.body.page_link || !req.body.role || !req.body.token || !req.body.uuid) {
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

    let email = dbHelper.decrypt(req.body.uuid)
    let role = req.body.role ? req.body.role : 'employer'

    dbHelper.validateToken(req.body.token, (err, tokenRes) => {
        if (err) {
            console.log('err in storeCampaignLog', err)
            console.log('Exiting storeCampaignLog')
            res.send({
                status: err,
                data: {},
                err: {
                    msg: message.something_went_wrong,
                    err: err
                }
            })
            return;
        }else{
            let status = null
            let expiry_date = tokenRes.expiryDate
            if(tokenRes.status == 200){
               status = 'active'
            }else if(tokenRes.status == 400){
                status = 'expired'
            }
            else if(tokenRes.status == 401){
                status = 'unauthorized'
            }
            else if(tokenRes.status == 403){
                status = 'forbidden'
            }else{
                status = 'invalid'
            }

            let campaign_request = {
                uuid: req.body.uuid,
                email: email,
                role: req.body.role,
                page_link: req.body.page_link,
                expiry_date: expiry_date,
                status: status
            }
            const campaign = new CampaignLogs(campaign_request)
            campaign.save((err, response) => {
                if (err) {
                    console.log('err in storeCampaignLog', err)
                    console.log('Exiting storeCampaignLog')
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
                    console.log('successfully created log')
                    console.log('log response', response)
                    let email_content = {
                        msg: `An ${role.toLowerCase()} has visited the campaign page, please find the details below :`,
                        uuid: response.uuid,
                        email: response.email,
                        page_link: response.page_link,
                        role: role,
                        clicked_on: response.clicked_on,
                        status: response.status,
                        link_expired: expiry_date
                    }

                    dbHelper.sendEmailToHrAfterEmployerClicksOnCampaignLink(email_content, (err, cbResponse) => {
                        console.log(err, cbResponse)
                    })
                    res.send({
                        status: 200,
                        data: {
                            msg: message.success
                        },
                        err: {}
                    })
                    return;
                }
            })
        }
    })
}

exports.getCampaignAnalytics = (req, res) => {
    console.log('Entering getCampaignAnalytics')
    console.log('Request Body :: ', req.body)
    console.log('Request params :: ', req.params)
    console.log("request query :: ", req.query);

    const page = req.query.page
    const limit = req.query.limit

    let sort = req.query.sort ? req.query.sort: '-1'

    console.log(typeof(sort))
    let pagination = {}

    if (page != null && limit != null) {
        pagination.limit = limit
        pagination.page = page
    }

    console.log('pagination', pagination)
    var campaignAggregation = CampaignLogs.aggregate([
        {
            $group: {
                _id: {email: '$email', uuid: '$uuid'},
                count: {$sum: 1},
                Id: {
                    $addToSet: '$uuid'
                }
            },
        }
    ])

    CampaignLogs.aggregatePaginate(campaignAggregation, pagination)
    .then(function(results){
        console.log(results);
        analytics = results.docs.map((e) => {
            return {
                uuid: e._id.uuid,
                email : e._id.email,
                count : e.count
            }
        })

        if(sort == '-1' || sort == 'desc'){
            analytics.sort((a, b) => b.email.localeCompare(a.email))
        }else if(sort == '1' || sort == 'asc'){
            analytics.sort((a, b) => a.email.localeCompare(b.email))
        }

        res.send({
            status: 200,
            data: {
                logs: analytics
            },
            err: {}
        })
        return;
    }).catch(function(err){
        console.log(err);
        res.status(500).jsonp({
            status: 500,
            data: {},
            error: {
                msg: message.something_went_wrong,
                err: err,
            },
        });
        return;
    })
}

exports.getCampaignDetailsByUUID = (req, res) => {
    console.log('Entering getCampaignAnalytics')
    console.log('Request Body :: ', req.body)
    console.log('Request params :: ', req.params)
    console.log("request query :: ", req.query);

    const page = req.query.page
    const limit = req.query.limit
    const sort = req.query.sort

    let pagination = {}

    if (page != null && limit != null) {
        pagination.limit = limit * 1
        pagination.skip = ((page - 1) * limit)
    }

    if (sort) {
        pagination.sort = {
            "clicked_on": sort
        }
    }

    console.log('pagination', pagination)

    CampaignLogs.find({
        uuid: req.params.uuid
    },{}, pagination, (err, response) => {
        if(err){
            res.status(500).jsonp({
                status: 500,
                data: {},
                error: {
                    msg: message.something_went_wrong,
                    err: err,
                },
            });
            return;
        }else{
            res.send({
                status: 200,
                data: {
                    logs: response
                },
                err: {}
            })
            return;
        }
    })
}
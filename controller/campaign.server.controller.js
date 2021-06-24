var waterfall = require('async-waterfall');
var utility = require('../service/utils')
var dbHelper = require('../service/db_helper')
var nodemailer = require('nodemailer');
const config = require('config');
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
                        msg: 'An employer has visited the campaign page, please find the details below :',
                        uuid: response.uuid,
                        email: response.email,
                        page_link: response.page_link,
                        clicked_on: response.clicked_on
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
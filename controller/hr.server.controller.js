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

exports.getJobsSummary = function (req, res) {
    console.log("HR Controller: entering getJobsSummary")
    console.log('Request params :: ', req.params)
    console.log("request query :: ", req.query);

    let start_date = req.query.start_date ? req.query.start_date : null
    let end_date = req.query.end_date ? req.query.end_date : null

    async.parallel({
        one: function(cb){
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
            if(start_date != null && end_date != null){
                condition.date = {
                    $gte: new Date(new Date(start_date).setHours(00, 00, 00)),
                    $lte: new Date(new Date(end_date).setHours(23, 59, 59)),                    
                }      
            }
            console.log('condition', condition)
            NaukriPostedJob.find(condition, (err, jobs) => {
                if(err){
                    console.log('err in NaukriPostedJob', err)
                    console.log('Exiting NaukriPostedJob')
                    cb(err, null)
                    return;
                }else{                   
                    cb(null, jobs)
                }
            })
        },
        two: function(cb){
            let condition = {}
            if(start_date != null && end_date != null){
                condition.created = {
                    $gte: new Date(new Date(start_date).setHours(00, 00, 00)),
                    $lt: new Date(new Date(end_date).setHours(23, 59, 59))
                }      
            }
            UsersAndJobsApplied.find(condition, (err, applied_jobs) => {
                if(err){
                    console.log('err in UsersAndJobsApplied', err)
                    console.log('Exiting UsersAndJobsApplied')
                    cb(err, null)
                    return;
                }else{
                    cb(null, applied_jobs)
                }
            })
        },
        three: function(cb){
            let condition = {}
            if(start_date != null && end_date != null){
                condition.created = {
                    $gte: new Date(new Date(start_date).setHours(00, 00, 00)),
                    $lt: new Date(new Date(end_date).setHours(23, 59, 59))
                }      
            }
            RegisteredUsers.find(condition, (err, users) => {
                if(err){
                    console.log('err in user regsitration', err)
                    console.log('Exiting RegisteredUsers')
                    cb(err, null)
                    return;
                }else{
                    cb(null, users)
                }
            })
        }
    }, (err, result) => {
        if(err){
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
            let jobsCount = result.one.length;
            let jobsAppliedCount = result.two.length;
            let usersCount = result.three.length;

            res.send({
                status: 200,
                data: {
                    jobs: jobsCount,
                    applied: jobsAppliedCount,
                    candidates: usersCount
                },
                err: {}
            })
            return;
        }
    })
}
var waterfall = require('async-waterfall');
var utility = require('../service/utils')

const NaukriPostedJob = require('../models/NaukriPostedJobSchema');

exports.getjob = function(req, res) {

    var check = utility.checkRequestBody(req.body)
    if (check.error) {
        res.status(400).send(check.message)
    }

    condition = utility.getFilterCondition(req.body.filter)
    NaukriPostedJob.find(condition,
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
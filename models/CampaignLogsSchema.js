'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const getTags = tags => tags.join(',');
const setTags = tags => {
    if (!Array.isArray(tags)) return tags.split(',').slice(0, 10); // max tags
    return [];
};

const CampaignLogsSchema = new Schema({
    uuid: {
        type: String,
        default: null,
        trim: true,
    },
    email: {
        type: String,
        default: null,
        trim: true,
    },
    role: {
        type: String,
        default: null,
        trim: true,
    },
    page_link: {
        type: String,
        default: null,
        trim: true,
    },
    status: {
        type: String,
        default: null,
        trim: true,
    },
    expiry_date: {
        type: Date,
        default: null
    }, 
    clicked_on: { type: Date, default: Date.now },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});

CampaignLogsSchema.plugin(aggregatePaginate);

const campaignlogs = mongoose.model('campaignlogs', CampaignLogsSchema);

module.exports = campaignlogs;
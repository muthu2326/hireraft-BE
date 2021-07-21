'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const getTags = tags => tags.join(',');
const setTags = tags => {
    if (!Array.isArray(tags)) return tags.split(',').slice(0, 10); // max tags
    return [];
};

const JobLogsSchema = new Schema({
    job_id: {
        type: String,
        default: null,
        trim: true,
    },
    user_id: {
        type: String,
        default: null,
        trim: true,
    },
    job_type: {
        type: String,
        default: 'cms',
        trim: true,
    },
    action: {
        type: String,
        default: 'view',
        trim: true,
    },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});

const joblogs = mongoose.model('joblogs', JobLogsSchema);

module.exports = joblogs;
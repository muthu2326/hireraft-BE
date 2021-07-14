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

const UsersAndJobsAppliedSchema = new Schema({
    job_id: {
        type: String,
        default: '',
        trim: true,
    },
    user_id: {
        type: String,
        default: '',
        trim: true,
    },
    applied_date: { type: Date, default: Date.now },
    status: {
        type: String,
        default: '',
        trim: true,
    },
    job_type: {
        type: String,
        default: 'db',
        trim: true,
    },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});

const usersAndJobsApplied = mongoose.model('usersandJobsApplied', UsersAndJobsAppliedSchema);

module.exports = usersAndJobsApplied;
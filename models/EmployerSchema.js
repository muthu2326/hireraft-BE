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

const EmployerSchema = new Schema({
    encrypt_id: {
        type: String,
        default: null,
        trim: true,
    },
    name: {
        type: String,
        default: null,
        trim: true,
    },
    email: {
        type: String,
        default: null,
        trim: true,
    },
    phone: {
        type: String,
        default: null,
        trim: true,
    },
    candidates: [],
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});

const employer = mongoose.model('employer', EmployerSchema);

module.exports = employer;
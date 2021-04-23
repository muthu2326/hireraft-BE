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

const Session = new Schema({
    userId: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    token: {
        type: String,
        default: null,
    },        
    expiryDate: { type: Date, default: null },    
    role: {
        type: String,
        default: null
    },    
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});

const session = mongoose.model('session', Session);

module.exports = session;
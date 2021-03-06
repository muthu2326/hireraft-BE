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

const SurveySchema = new Schema({
    encrypt_id: {
        type: String,
        default: null,
        trim: true,
    },
    type: {
        type: String,
        default: null,
        trim: true,
    },
    email: {
        type: String,
        default: null,
        trim: true,
    },
    questions: {
        type: Object,
        default: {
            question: {
                type: String,
                default: null,
                trim: true,
            },
            answers: Array
        }
    },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});

const survey = mongoose.model('survey', SurveySchema);

module.exports = survey;
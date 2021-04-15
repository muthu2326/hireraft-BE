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

/**
 * Article Schema
 */


const NaukriPostedJobSchema = new Schema({
    technology: {
        type: String,
        default: '',
        trim: true,
    },
    company_name: {
        type: String,
        default: '',
        trim: true,
    },
    company_address: {
        type: String,
        default: '',
        trim: true,
    },
    company_website: {
        type: String,
        default: '',
        trim: true,
    },
    email: {
        type: String,
        default: '',
        trim: true,
    },
    phone: {
        type: String,
        default: '',
        trim: true,
    },
    company_contact_person: {
        type: String,
        default: '',
        trim: true,
    },
    company_contact_person_role: {
        type: String,
        default: null,
        trim: true,
    },
    raw_job_description: {
        type: String,
        default: '',
        trim: true,
    },
    job_description: {
        type: String,
        default: '',
        trim: true,
    },
    raw_skills_required: {
        type: String,
        default: '',
        trim: true,
    },
    skills_required:[],
    raw_salary_package: {
        type: String,
        default: '',
        trim: true,
    },
    raw_experience_required: {
        type: String,
        default: '',
        trim: true,
    },
    raw_qualifications: {
        type: String,
        default: '',
        trim: true,
    },
    qualifications:[],
    role: {
        type: String,
        default: '',
        trim: true,
    },
    industry_type: {
        type: String,
        default: '',
        trim: true,
    },
    functional_area: {
        type: String,
        default: '',
        trim: true,
    },
    employment_type: {
        type: String,
        default: '',
        trim: true,
    },
    role_category: {
        type: String,
        default: '',
        trim: true,
    },
    notice_period: {
        type: String,
        default: '',
        trim: true,
    },
    job_post_datetime: {
        type: String,
        default: '',
        trim: true,
    },
    url: {
        type: String,
        default: '',
        trim: true,
    },
    date: {
        type: Date,
        default: Date.now
    },
    salary_min: {
        type: Number,
        default: '',
        trim: true,
    },
    salary_max: {
        type: Number,
        default: '',
        trim: true,
    },
    experience_min: {
        type: Number,
        default: '',
        trim: true,
    },
    experience_max: {
        type: Number,
        default: '',
        trim: true,
    },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});


const naukriPostedJob = mongoose.model('naukriPostedJob', NaukriPostedJobSchema);

module.exports = naukriPostedJob;
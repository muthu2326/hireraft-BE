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

const RegisteredUsersSchema = new Schema({
    name: {
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
    course: {
        type: String,
        default: '',
        trim: true,
    },
    passing_year: {
        type: Number,
        default: 0,
        trim: true,
    },
    skills: [],
    joining_by: {
        type: String,
        default: '',
        trim: true,
    },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});

const registeredUsers = mongoose.model('registeredUsers', RegisteredUsersSchema);

module.exports = registeredUsers;
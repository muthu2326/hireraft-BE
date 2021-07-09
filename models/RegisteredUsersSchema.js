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
    _id: {
        type: String,
        key: true
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
    password: {
        type: String,
        default: null,
        trim: true,
    },
    phone: {
        type: String,
        default: null,
        trim: true,
    },
    course: {
        type: String,
        default: null,
        trim: true,
    },
    passing_year: {
        type: Number,
        default: 0,
        trim: true,
    },
    skills: {
        type: Array,
        default: []
    },
    joining_by: {
        type: String,
        default: null,
        trim: true,
    },
    subscribe: {
        type: Boolean,
        default: false,
        trim: true,
    },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});

const registeredUsers = mongoose.model('registeredUsers', RegisteredUsersSchema);

module.exports = registeredUsers;
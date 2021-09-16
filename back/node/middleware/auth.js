'use strict';

const config    = require('../config/config');
const i18n      = require('i18n');

function user() {
    return (req, res, next) => {
        if (req.headers.usrtoken) {
            req.usrtoken = req.headers.usrtoken;
            next();
        }
        else
            res.status(403).json({ code: 400, data: null, message: i18n.__('404oauth')})
    }
}

module.exports.user = user;

function authDoc() {
    return (req, res, next) => {
        if (req.query.token === config.swaggerKey)
            next();
        else
            res.status(403).json({ code: 403, data: null, message: i18n.__('403')})
    }
}

module.exports.authDoc = authDoc;

function Unauthorized() {
    return (req, res, next) => {
        res.status(403).json({ code: 403, data: null, message: i18n.__('403')})
    }
}

module.exports.Unauthorized = Unauthorized;

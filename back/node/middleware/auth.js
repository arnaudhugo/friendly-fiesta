'use strict';

const config    = require('../config/config');
const jwt       = require('jsonwebtoken');
const fetch     = require('node-fetch');
const i18n      = require('i18n');

function user() {
    return (req, res, next) => {
        if (req.headers.usrtoken) {
            jwt.verify(req.headers.usrtoken, config.publicKey, { leeway: 0, issuer: "auth:back", audience: `auth:${config.registry_id}`, algorithms: ['RS256'] }, function(err, user) {
                if (err) {
                    res.status(400).json({ code: 400, data: null, message: i18n.__('400oauth')})
                }
                req.usrtoken = req.headers.usrtoken;
                next();
            });
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

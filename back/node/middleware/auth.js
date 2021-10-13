'use strict';

const r         = require('rethinkdb');
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
                console.log(`User verify, ${JSON.stringify(user)}`)
                req.userId = user.payload.id;
                req.username = user.payload.username;
                req.email = user.payload.email;

                r.table('user')
                    .insert({
                        id: req.userId,
                        username: req.username,
                        email: req.email
                    })
                    .run(req._rdb)
                    .then(result => next())
                    .catch(error => {
                        console.log(error);
                        if (error) {
                            res.status(500).json({ code: 500, data: null, message: error });
                        } else {
                            res.status(500).json({ code: 500, data: null, message: i18n.__('500') });
                        }
                    });
                
            });
        }
        else
            res.status(404).json({ code: 404, data: null, message: i18n.__('404oauth')})
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

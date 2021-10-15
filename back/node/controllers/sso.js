'use strict';

const config            = require('../config/config');
const fetch             = require('node-fetch');
const router            = require('express').Router();
const auth              = require('../middleware/auth.js');
const TokenGenerator    = require('uuid-token-generator');
const TinyDB            = require('tinydb');

const test_db           = new TinyDB('/tmp/test.db');

/**
* @swagger
* /sso:
*   get:
*     tags:
*       - SSO
*     name: Get information to connect
*     summary: Get information to connect
*     consumes:
*       - application/json
*     responses:
*       200:
*         description: Ok
*       500:
*         description: 'Bad request : something went wrong.'
*/
router.get('/', async (req, res) => {
    const uuid = new TokenGenerator().generate();
    const body = {
        "apitoken":     config.apitoken,
        "asked":        ['id', 'username', 'email', 'last_name', 'first_name'],
        "valid_until":  180
    }

    let response = await fetch(
        `${config.sso_back}/extern/key`, 
        {
            method: 'post',
            body:    JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        }
    )
    response = await response.json();

    console.log(response)
    
    await test_db.setInfo(uuid, {key: response.data.key, secret: response.data.secret})

    const ret = {
        uuid: uuid,
        url: `${config.sso_front}/sso/extern/${response.data.key}/${response.data.auth}/accept`
    }

    res.status(200).json({ code: 200, data: ret, message: "" });
});

/**
* @swagger
* /sso/{uuid}:
*   get:
*     tags:
*       - SSO
*     name: Pending connection
*     summary: Pending connection
*     consumes:
*       - application/json
*     parameters:
*       - name: uuid
*         in: path
*         schema:
*           type: string
*         required: true
*     responses:
*       200:
*         description: Ok
*       500:
*         description: 'Bad request : something went wrong.'
*/
router.get('/:uuid', async (req, res) => {
    const uuid = req.params.uuid;

    test_db.getInfo(uuid, function(err, key, value) {
        if (err) {
            console.log(err);
            res.status(500).json({ code: 500, data: null, message: err });
        }

        const body = {
            "apitoken":     config.apitoken,
            "secret":       value.secret
        }
        
        fetch(
            `${config.sso_back}/extern/key/${value.key}/token`, 
            {
                method: 'post',
                body:    JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' },
            }
        ).then(
            response => response.json()
        ).then(json => {
            res.status(200).json({ code: 200, data: json.data, message: "" });
        })
    });
});

module.exports = router;
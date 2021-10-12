'use strict';

const fetch             = require('node-fetch');
const router            = require('express').Router();
const auth              = require('../middleware/auth.js');
const TokenGenerator    = require('uuid-token-generator');
const TinyDB            = require('tinydb');

const test_db       = new TinyDB('/tmp/test.db');

const sso_front     = 'http://135.125.203.6:8079';
const sso_back      = 'http://135.125.203.6:8083';
const apitoken      = "c9a94ee6579145b7b9b5c7dbfff70ab8";
const registry_id   = "5a5d6b6a-9879-48ac-8127-a998e4bc88ca";

router.get('/', async (req, res) => {
    console.log('1')
    test_db.onReady = await function() {
        console.log('2')
        const body = {
            "apitoken":     apitoken,
            "asked":        ['id', 'username', 'email'],
            "valid_until":  180
        }
    }
        let response = await fetch(
            `${sso_back}/extern/key`, 
            {
                method: 'post',
                body:    JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' },
            }
        )
        response = await response.json();
        
        let uuid = new TokenGenerator().generate();
    
        // test_db.setInfo(uuid, {key: response.data.key, secret: response.data.secret}, function(err, key, value) {
        //     if (err) {
        //         res.status(500).json({ code: 500, data: null, message: err });
        //     }
            
        //     console.log('[setInfo] ' + key + ' : ' + value);
        // });
        await test_db.setInfo(uuid, {key: response.data.key, secret: response.data.secret})
        
        let ret = {
            id: uuid,
            url: `${sso_front}/sso/extern/${response.data.key}/${response.data.auth}/accept`
        }
        console.log(response, ret)
    
        res.status(200).json({ code: 200, data: ret, message: "" });
    // }
});

router.get('/:uuid', async (req, res) => {
    const uuid = req.params.id;

    test_db.onReady = async function() {
        let re = await test_db.getInfo(uuid);

        console.log(re)

        const body = {
            "apitoken":     apitoken,
            "secret":       re.secret
        }
        
        let response = await fetch(
            `${sso_back}/extern/key/${key}/token`, 
            {
                method: 'post',
                body:    JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' },
            }
        )
        response = await response.json();

        console.log(response)
        
        res.status(200).json({ code: 200, data: response.data, message: "" });
        
        // test_db.getInfo(uuid, async function(err, key, value) {
        //     if (err) {
        //         res.status(500).json({ code: 500, data: null, message: err });
        //     }
            
        //     console.log('[setInfo] ' + key + ' : ' + value);

        //     const body = {
        //         "apitoken":     apitoken,
        //         "secret":       value.secret
        //     }
            
        //     let response = await fetch(
        //         `${sso_back}/extern/key/${key}/token`, 
        //         {
        //             method: 'post',
        //             body:    JSON.stringify(body),
        //             headers: { 'Content-Type': 'application/json' },
        //         }
        //     )
        //     response = await response.json();

        //     console.log(response)
            
        //     res.status(200).json({ code: 200, data: response.data, message: "" });
        // });
    }
});

module.exports = router;
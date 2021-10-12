'use strict';

const r         = require('rethinkdb');
const config    = require('../config/config');
const auth      = require('../middleware/auth.js');
const router    = require('express').Router();
const i18n      = require("i18n");

const tableName = "invest";

/**
* @swagger
* /invest:
*   post:
*     tags:
*       - Invest
*     name: Invest to an project
*     summary: Invest to an project
*     consumes:
*       - application/json
*     parameters:
*       - name: body
*         in: body
*         schema:
*           type: object
*           properties:
*             amount:
*               type: float
*             percent_proposal:
*               type: string
*         required: true
*     responses:
*       200:
*         description: Ok
*       500:
*         description: 'Bad request : something went wrong.'
*/
router.post('/', auth.user(), async (req, res) => {
    let project = {
        userId:             req.usrtoken,
        amount:             req.body.amount,
        percent_proposal:   req.body.percent_proposal
    };

    r.table(tableName)
        .insert(project)
        .run(req._rdb)
        .then(cursor => cursor.toArray())
        .then(result => res.status(200).json({ code: 200, data: result, message: "" }))
        .catch(error => {
            console.log(error);
            if (error) {
                res.status(500).json({ code: 500, data: null, message: error.msg });
            } else {
                res.status(500).json({ code: 500, data: result, message: i18n.__('500') });
            }
        });
});

module.exports = router;
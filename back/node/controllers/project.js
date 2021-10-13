'use strict';

const r         = require('rethinkdb');
const config    = require('../config/config');
const auth      = require('../middleware/auth.js');
const router    = require('express').Router();
const i18n      = require("i18n");

const tableName = "project";

/**
* @swagger
* /project/all:
*   get:
*     tags:
*       - Project
*     name: Get all project
*     summary: Return all project
*     consumes:
*       - application/json
*     responses:
*       200:
*         description: Ok
*       500:
*         description: 'Bad request : something went wrong.'
*/
router.get('/all', async (req, res) => {
    r.table(tableName)
        .run(req._rdb)
        .then(cursor => cursor.toArray())
        .then(result => res.status(200).json({ code: 200, data: result, message: "" }))
        .catch(error => {
            console.log(error);
            if (error) {
                res.status(500).json({ code: 500, data: null, message: error });
            } else {
                res.status(500).json({ code: 500, data: null, message: i18n.__('500') });
            }
        });
});

/**
* @swagger
* /project:
*   get:
*     security:
*       - usrtoken: []
*     tags:
*       - Project
*     name: Get all project for an user
*     summary: Return all project for an user
*     consumes:
*       - application/json
*     responses:
*       200:
*         description: Ok
*       500:
*         description: 'Bad request : something went wrong.'
*/
router.get('/', auth.user(), async (req, res) => {
    r.table(tableName)
        .filter({ userId: req.userId })
        .run(req._rdb)
        .then(cursor => cursor.toArray())
        .then(result => res.status(200).json({ code: 200, data: result, message: "" }))
        .catch(error => {
            console.log(error);
            if (error) {
                res.status(500).json({ code: 500, data: null, message: error });
            } else {
                res.status(500).json({ code: 500, data: null, message: i18n.__('500') });
            }
        });
});

/**
* @swagger
* /project/{id}:
*   get:
*     security:
*       - usrtoken: []
*     tags:
*       - Project
*     name: Get one project for an user
*     summary: Return one project for an user
*     consumes:
*       - application/json
*     parameters:
*       - name: id
*         in: path
*         required: true
*     responses:
*       200:
*         description: Ok
*       500:
*         description: 'Bad request : something went wrong.'
*/
router.get('/:id', auth.user(), async (req, res) => {
    const id = req.params.id;

    r.table(tableName)
        .filter({ userId: req.userId, id: id })
        .run(req._rdb)
        .then(cursor => cursor.toArray())
        .then(result => {
            r.table('invest')
                .filter({ projectId: id })
                .eq_join('id', r.table('user')).zip()
                .run(req._rdb)
                .then(cursor => cursor.toArray())
                .then(invests => {
                    console.log(invests)
                    let list = []
                    let totalAmount = 0;
                    let totalValid = 0;
                    let lowestPercent = 9999;
                    for (const invest of invests) {
                        if (invest.validated == true) {
                            totalAmount += parseFloat(invest.amount);
                            totalValid += 1;
                            if (parseFloat(invest.percent_proposal) < lowestPercent)
                                lowestPercent = parseFloat(invest.percent_proposal);
                        }
                        list.push({
                            id:         invest.id,
                            usr_id:     invest.userId,
                            percent:    invest.percent_proposal,
                            amount:     invest.amount,
                            validated:  invest.validated
                        })
                    }

                    result[0].advancement = {
                        "percent": ((totalAmount / parseFloat(result[0].request.amount)) * 100).toFixed(2),
                        "start_date": "timestamp",
                        "end_date": "timestamp",
                        "investors": {
                            "stats": {
                                "number": list.length,
                                "average_invest": (totalAmount / totalValid).toFixed(2),
                                "lowest_percent": lowestPercent
                            },
                            "list": list
                        }
                    }
                    res.status(200).json({ code: 200, data: result, message: "" })
                }).catch(error => {
                    console.log(error);
                    if (error) {
                        res.status(500).json({ code: 500, data: null, message: error });
                    } else {
                        res.status(500).json({ code: 500, data: null, message: i18n.__('500') });
                    }
                });
        }).catch(error => {
            console.log(error);
            if (error) {
                res.status(500).json({ code: 500, data: null, message: error });
            } else {
                res.status(500).json({ code: 500, data: null, message: i18n.__('500') });
            }
        });
});

/**
* @swagger
* /project:
*   post:
*     security:
*       - usrtoken: []
*     tags:
*       - Project
*     name: Create one project
*     summary: Create one project
*     consumes:
*       - application/json
*     parameters:
*       - name: body
*         in: body
*         schema:
*           type: object
*           properties:
*             name:
*               type: string
*             description:
*               type: string
*             photo:
*               type: image_base64
*             request:
*               type: object
*               properties:
*                 amount:
*                   type: float
*                 currency:
*                   type: string
*                 max_percent:
*                   type: float
*                 months:
*                   type: integer
*         required: true
*     responses:
*       200:
*         description: Ok
*       500:
*         description: 'Bad request : something went wrong.'
*/
router.post('/', auth.user(), async (req, res) => {
    let project = {
        userId:             req.userId,
        name:               req.body.name,
        description:        req.body.description,
        photo:              req.body.photo,
        request:            {
            amount:         req.body.request.amount,
            currency:       req.body.request.currency,
            max_percent:    req.body.request.max_percent,
            months:         req.body.request.months
        },
        start_date:         new Date().getTime(),
        end_date:           new Date().setMonth(new Date().getMonth() + req.body.request.months)
    };

    r.table(tableName)
        .insert(project)
        .run(req._rdb)
        .then(result => res.status(200).json({ code: 200, data: result, message: "" }))
        .catch(error => {
            console.log(error);
            if (error) {
                res.status(500).json({ code: 500, data: null, message: error });
            } else {
                res.status(500).json({ code: 500, data: null, message: i18n.__('500') });
            }
        });
});

/**
* @swagger
* /project/{id}:
*   put:
*     security:
*       - usrtoken: []
*     tags:
*       - Project
*     name: Unpdate one project for an user
*     summary: Update one project for an user
*     consumes:
*       - application/json
*     parameters:
*       - name: id
*         in: path
*         required: true
*       - name: body
*         in: body
*         schema:
*           type: object
*           properties:
*             name:
*               type: string
*             description:
*               type: string
*             photo:
*               type: image_base64
*             request:
*               type: object
*               properties:
*                 amount:
*                   type: float
*                 currency:
*                   type: string
*                 max_percent:
*                   type: float
*                 months:
*                   type: integer
*     responses:
*       200:
*         description: Ok
*       500:
*         description: 'Bad request : something went wrong.'
*/
router.put('/:id', auth.user(), async (req, res) => {
    const projectId = req.params.id;

    r.table(tableName)
        .filter({ userId: req.userId, id: projectId })
        .update({
            name:               req.body.name,
            description:        req.body.description,
            photo:              req.body.photo,
            request:            {
                amount:         req.body.request.amount,
                currency:       req.body.request.currency,
                max_percent:    req.body.request.max_percent,
                months:         req.body.request.months
            },
            start_date:         new Date().getTime(),
            end_date:           new Date().setMonth(new Date().getMonth() + req.body.request.months)
        })
        .run(req._rdb)
        .then(result => res.status(200).json({ code: 200, data: result, message: "" }))
        .catch(error => {
            console.log(error);
            if (error) {
                res.status(500).json({ code: 500, data: null, message: error });
            } else {
                res.status(500).json({ code: 500, data: null, message: i18n.__('500') });
            }
        });
});

/**
* @swagger
* /project/{id}:
*   delete:
*     security:
*       - usrtoken: []
*     tags:
*       - Project
*     name: Delete one project for an user
*     summary: Delete one project for an user
*     consumes:
*       - application/json
*     parameters:
*       - name: id
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
router.delete('/:id', auth.user(), async (req, res) => {
    const projectId = req.params.id;

    r.table(tableName)
        .filter({ userId: req.userId, id: projectId })
        .delete()
        .run(req._rdb)
        .then(result => res.status(200).json({ code: 200, data: result, message: "" }))
        .catch(error => {
            console.log(error);
            if (error) {
                res.status(500).json({ code: 500, data: null, message: error });
            } else {
                res.status(500).json({ code: 500, data: null, message: i18n.__('500') });
            }
        });
});

module.exports = router;
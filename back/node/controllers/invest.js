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
*   get:
*     security:
*       - usrtoken: []
*     tags:
*       - Invest
*     name: Get all project where user invest
*     summary: Get all project where user invest
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
                res.status(500).json({ code: 500, data: result, message: i18n.__('500') });
            }
        });
});

/**
* @swagger
* /invest/{id}:
*   post:
*     security:
*       - usrtoken: []
*     tags:
*       - Invest
*     name: Invest to an project
*     summary: Invest to an project
*     consumes:
*       - application/json
*     parameters:
*       - name: id
*         in: path
*         schema:
*           type: string
*         required: true
*       - name: body
*         in: body
*         schema:
*           type: object
*           properties:
*             amount:
*               type: float
*             percent_proposal:
*               type: float
*         required: true
*     responses:
*       200:
*         description: Ok
*       500:
*         description: 'Bad request : something went wrong.'
*/
router.post('/:id', auth.user(), async (req, res) => {
    const projectId = req.params.id;

    let invest = {
        userId:             req.userId,
        projectId:          projectId,
        amount:             req.body.amount,
        percent_proposal:   req.body.percent_proposal,
        validated:          false,
        docGen:             false,
        docUrl:             null
    };

    r.table(tableName)
        .insert(invest)
        .run(req._rdb)
        .then(result => res.status(200).json({ code: 200, data: result, message: "" }))
        .catch(error => {
            console.log(error);
            if (error) {
                res.status(500).json({ code: 500, data: null, message: error });
            } else {
                res.status(500).json({ code: 500, data: result, message: i18n.__('500') });
            }
        });
});

/**
* @swagger
* /invest/choose/{id}:
*   post:
*     security:
*       - usrtoken: []
*     tags:
*       - Invest
*     name: Valid an invest to an project by owner
*     summary: Valid an invest to an project by owner
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
router.post('/choose/:id', auth.user(), async (req, res) => {
    const investId = req.params.id;

    r.table(tableName)
        .filter({ id: investId })
        .run(req._rdb)
        .then(cursor => cursor.toArray())
        .then(result => {
            r.table('project')
                .filter({ id: result[0].projectId })
                .run(req._rdb)
                .then(cursor => cursor.toArray())
                .then(project => {
                    if (project[0].userId == req.userId) {
                        r.table(tableName)
                            .filter({ id: investId, projectId: result[0].projectId })
                            .update({
                                validated:   true
                            })
                            .run(req._rdb)
                            .then(resultUp => res.status(200).json({ code: 200, data: resultUp, message: "" }))
                            .catch(error => {
                                console.log(error);
                                if (error) {
                                    res.status(500).json({ code: 500, data: null, message: error });
                                } else {
                                    res.status(500).json({ code: 500, data: null, message: i18n.__('500') });
                                }
                            });
                    }
                    else {
                        res.status(403).json({ code: 403, data: null, message: i18n.__('403') })
                    }
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
* /invest/doc/{id}:
*   get:
*     security:
*       - usrtoken: []
*     tags:
*       - Invest
*     name: Get document
*     summary: Get document
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
router.post('/doc/:id', auth.user(), async (req, res) => {
    const investId = req.params.id;

    r.table(tableName)
        .filter({ id: investId })
        .run(req._rdb)
        .then(cursor => cursor.toArray())
        .then(result => {
            if (result[0].userId == req.userId && result[0].validated == true && result[0].docGen == true) {
                res.status(200).json({ code: 200, data: result[0].docUrl, message: "" })
            }
            else {
                res.status(403).json({ code: 403, data: null, message: i18n.__('403') })
            }
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
* /invest/valid/{id}:
*   post:
*     security:
*       - usrtoken: []
*     tags:
*       - Invest
*     name: Valid an invest to an project by invest
*     summary: Valid an invest to an project by invest
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
router.post('/valid/:id', auth.user(), async (req, res) => {
    const investId = req.params.id;

    r.table(tableName)
        .filter({ id: investId })
        .run(req._rdb)
        .then(cursor => cursor.toArray())
        .then(result => {
            if (result[0].userId == req.userId && result[0].validated == true) {
                r.table(tableName)
                    .filter({ id: investId, projectId: result[0].projectId })
                    .update({
                        docGen:     true,
                        docUrl:     ""
                    })
                    .run(req._rdb)
                    .then(resultUp => res.status(200).json({ code: 200, data: resultUp, message: "" }))
                    .catch(error => {
                        console.log(error);
                        if (error) {
                            res.status(500).json({ code: 500, data: null, message: error });
                        } else {
                            res.status(500).json({ code: 500, data: null, message: i18n.__('500') });
                        }
                    });
            }
            else {
                res.status(403).json({ code: 403, data: null, message: i18n.__('403') })
            }
        }).catch(error => {
            console.log(error);
            if (error) {
                res.status(500).json({ code: 500, data: null, message: error });
            } else {
                res.status(500).json({ code: 500, data: null, message: i18n.__('500') });
            }
        });
});


module.exports = router;
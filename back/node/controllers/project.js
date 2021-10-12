'use strict';

const r         = require('rethinkdb');
const config    = require('../config/config');
const auth      = require('../middleware/auth.js');
const router    = require('express').Router();
const i18n      = require("i18n");

const tableName = "project";

/**
* @swagger
* /project:
*   get:
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
        .orderBy(r.desc('id'))
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

/**
* @swagger
* /project/:
*   get:
*     tags:
*       - Project
*     name: Get one project for an user
*     summary: Return one project for an user
*     consumes:
*       - application/json
*     parameters:
*       - name: id
*         in: query
*         required: true
*     responses:
*       200:
*         description: Ok
*       500:
*         description: 'Bad request : something went wrong.'
*/
router.get('/:id', auth.user(), async (req, res) => {
    const userId = req.usrtoken;

    r.table(tableName)
        .filter({ userId: userId })
        .run(req._rdb)
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

/**
* @swagger
* /project:
*   post:
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
*               type: array
*             request:
*               type: object
*               properties:
*                 amount:
*                   type: float
*                 currency:
*                   type: string
*                 max_percent:
*                   type: float
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
        name:               req.body.name,
        description:        req.body.description,
        photo:              req.body.photo,
        request:            {
            amount:         req.body.request.amount,
            currency:       req.body.request.currency,
            max_percent:    req.body.request.max_percent
        }
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

/**
* @swagger
* /project/:
*   put:
*     tags:
*       - Project
*     name: Unpdate one project for an user
*     summary: Update one project for an user
*     consumes:
*       - application/json
*     parameters:
*       - name: id
*         in: query
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
*               type: array
*             request:
*               type: object
*               properties:
*                 amount:
*                   type: float
*                 currency:
*                   type: string
*                 max_percent:
*                   type: float
*     responses:
*       200:
*         description: Ok
*       500:
*         description: 'Bad request : something went wrong.'
*/
router.put('/:id', auth.user(), async (req, res) => {
    const projectId = req.params.id;

    r.table(tableName)
        .get(projectId)
        .update({
            name:               req.body.name,
            description:        req.body.description,
            photo:              req.body.photo,
            request:            {
                amount:         req.body.request.amount,
                currency:       req.body.request.currency,
                max_percent:    req.body.request.max_percent
            }
        })
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

/**
* @swagger
* /project/:
*   delete:
*     tags:
*       - Project
*     name: Delete one project for an user
*     summary: Delete one project for an user
*     consumes:
*       - application/json
*     responses:
*       200:
*         description: Ok
*       500:
*         description: 'Bad request : something went wrong.'
*/
router.delete('/:id', auth.user(), async (req, res) => {
    const projectId = req.params.id;

    r.table(tableName)
        .get(projectId)
        .delete()
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
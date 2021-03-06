'use strict';

require('dotenv').config();
const port = process.env.PORT ? process.env.PORT : 8080;
const express               = require("express");
const bodyParser            = require("body-parser");
const config                = require('./config/config');
const cors                  = require('cors');
const i18n                  = require("i18n");
const loader                = require("auto-loader");
const auth                  = require('./middleware/auth.js');
const connect               = require('./helpers/rethink');
const controllers           = loader.load(__dirname + "/controllers");

const TinyDB            = require('tinydb');
const test_db       = new TinyDB('/tmp/test.db');

i18n.configure({
    locales:['en', 'fr'],
    directory: __dirname + '/locales'
});

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
    info: {
        title: 'GPE',
        version: '1.0',
        description: '',
    },
    host: 'api.gpe.newtechstack.fr',
    schemes: ['https'],
    basePath: '/v1',
    securityDefinitions: {
        usrtoken: {
            type: 'apiKey',
            name: 'usrtoken',
            in: 'header'
        }
    }
};

const options = {
    swaggerDefinition,
    apis: ['./controllers/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

const app = express();

app.use(bodyParser.json({limit: '50mb'}));
app.use(express.static("app/public"));
app.use(cors());
app.use(i18n.init);

app.use(connect.connect);

const router = express.Router();

router.use('/doc', swaggerUi.serve, auth.authDoc(), swaggerUi.setup(swaggerSpec));

for (const key in controllers) {
    router.use("/" + key, controllers[key]);
}

app.use('/v1', router);

app.get("*", (req, res) =>
    res.send('Hello World ' + new Date())
);

app.use(function(err, req, res, next) {
    if (res.headerSent)
        return next(err);

    if (process.env.NODE_ENV == 'production') {
        console.log(err);
        let result = {
            message:            err.message,
            stackTraceLimit:    err.stackTraceLimit,
            captureStackTrace:  err.captureStackTrace,
            stack:              err.stack,
            code:               err.code
        }

        res.status(err.status || 500).json({ code: 500, data: result, message: i18n.__('500') });
    }
    else
        res.status(500).json({ code: 500, data: null, message: i18n.__('500') });
});

app.use(connect.close); 

test_db.onReady = function() {
    console.log('tiny db up')
    connect.setup().then(() => {
        const server = app.listen(port, () => {
            let host = server.address().address;
            host = (host === '::' ? 'localhost' : host);
            console.log('1: We are live on ' + host + ':' + port);
        });
    })
}

process.on("uncaughtException", function(err) {
    console.error("An uncaughtException was found, the program will end. " + err + ", stacktrace: " + err.stack);
});

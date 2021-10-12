require("dotenv").config();
const process = require("process");
console.log('NODE_ENV:', process.env.NODE_ENV)
const env = process.env.NODE_ENV || 'development';

const config = {
    development: {
        "logging": true,
        "username": "???",
        "password": "",
        "database": "dev",
        "port": 28015,
        "host": "rethink",
        "swaggerKey": "owrUIos2mg8CqGQLaw24htSnaInF2HJB",
        "sso_front": "http://135.125.203.6:8079",
        "sso_back": "http://135.125.203.6:8083",
        "apitoken": "c9a94ee6579145b7b9b5c7dbfff70ab8",
        "registry_id": "5a5d6b6a-9879-48ac-8127-a998e4bc88ca"
    },
    production: {
        "logging": true,
        "username": "???",
        "password": "",
        "database": "dev",
        "port": 28015,
        "host": "rethink",
        "swaggerKey": "owrUIos2mg8CqGQLaw24htSnaInF2HJB",
        "sso_front": "http://135.125.203.6:8079",
        "sso_back": "http://135.125.203.6:8083",
        "apitoken": "c9a94ee6579145b7b9b5c7dbfff70ab8",
        "registry_id": "5a5d6b6a-9879-48ac-8127-a998e4bc88ca"
    },
}

module.exports = config[env];
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
        "swaggerKey": "owrUIos2mg8CqGQLaw24htSnaInF2HJB"
    },
    production: {
        "logging": true,
        "username": "???",
        "password": "",
        "database": "dev",
        "port": 28015,
        "host": "rethink",
        "swaggerKey": "owrUIos2mg8CqGQLaw24htSnaInF2HJB"
    },
}

module.exports = config[env];
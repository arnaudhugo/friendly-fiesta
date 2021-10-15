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
        "sso_front": "https://sso.newtechstack.fr",
        "sso_back": "https://api.sso.newtechstack.fr",
        "apitoken": "4a83e1b2527f408bb838fb5389208979",
        "registry_id": "1bb3ca94-afcb-47a8-a791-9c8bfc4adb95",
        "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBIzANBgkqhkiG9w0BAQEFAAOCARAAMIIBCwKCAQIA0Uqie+rDj8R4+W3Ak+li\nv10U0JAS154CzdlSYgSEd72KCQOCPA20jHCSsUEwcOHdpA5cts5u1l107ZYEbQlA\n2NwMMNpL1xrTbXvBh+76e6hnEnDnsApx9hSxyrzz2N7GrnPQMfI6rTWDGYfvG4BJ\nl+0SNWjCv8bOIUFYGZWj7faHNkw+q/41BG0G7O+0Yknx+cHlgXvDj4UawqzG7pxb\nwvAGmEO3aYgA+yEhTu3Jpwt5Bzb6CL6NUw6P/iHcLPExGxYnCfE54glaneKt639B\nnNVYAgisfo4Kzxtu+RB0tm6ZLDcEUiUIRo0kg79sYio3hXQi87KIuxhSThYtuU9V\nNrsCAwEAAQ==\n-----END PUBLIC KEY-----\n"
    },
    production: {
        "logging": true,
        "username": "???",
        "password": "",
        "database": "dev",
        "port": 28015,
        "host": "rethink",
        "swaggerKey": "owrUIos2mg8CqGQLaw24htSnaInF2HJB",
        "sso_front": "https://sso.newtechstack.fr",
        "sso_back": "https://api.sso.newtechstack.fr",
        "apitoken": "4a83e1b2527f408bb838fb5389208979",
        "registry_id": "1bb3ca94-afcb-47a8-a791-9c8bfc4adb95",
        "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBIzANBgkqhkiG9w0BAQEFAAOCARAAMIIBCwKCAQIA0Uqie+rDj8R4+W3Ak+li\nv10U0JAS154CzdlSYgSEd72KCQOCPA20jHCSsUEwcOHdpA5cts5u1l107ZYEbQlA\n2NwMMNpL1xrTbXvBh+76e6hnEnDnsApx9hSxyrzz2N7GrnPQMfI6rTWDGYfvG4BJ\nl+0SNWjCv8bOIUFYGZWj7faHNkw+q/41BG0G7O+0Yknx+cHlgXvDj4UawqzG7pxb\nwvAGmEO3aYgA+yEhTu3Jpwt5Bzb6CL6NUw6P/iHcLPExGxYnCfE54glaneKt639B\nnNVYAgisfo4Kzxtu+RB0tm6ZLDcEUiUIRo0kg79sYio3hXQi87KIuxhSThYtuU9V\nNrsCAwEAAQ==\n-----END PUBLIC KEY-----\n"
    }
}

module.exports = config[env];
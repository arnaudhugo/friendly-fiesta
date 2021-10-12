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
        "registry_id": "5a5d6b6a-9879-48ac-8127-a998e4bc88ca",
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
        "sso_front": "http://135.125.203.6:8079",
        "sso_back": "http://135.125.203.6:8083",
        "apitoken": "c9a94ee6579145b7b9b5c7dbfff70ab8",
        "registry_id": "5a5d6b6a-9879-48ac-8127-a998e4bc88ca",
        "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBIzANBgkqhkiG9w0BAQEFAAOCARAAMIIBCwKCAQIA0Uqie+rDj8R4+W3Ak+li\nv10U0JAS154CzdlSYgSEd72KCQOCPA20jHCSsUEwcOHdpA5cts5u1l107ZYEbQlA\n2NwMMNpL1xrTbXvBh+76e6hnEnDnsApx9hSxyrzz2N7GrnPQMfI6rTWDGYfvG4BJ\nl+0SNWjCv8bOIUFYGZWj7faHNkw+q/41BG0G7O+0Yknx+cHlgXvDj4UawqzG7pxb\nwvAGmEO3aYgA+yEhTu3Jpwt5Bzb6CL6NUw6P/iHcLPExGxYnCfE54glaneKt639B\nnNVYAgisfo4Kzxtu+RB0tm6ZLDcEUiUIRo0kg79sYio3hXQi87KIuxhSThYtuU9V\nNrsCAwEAAQ==\n-----END PUBLIC KEY-----\n"
    }
}

module.exports = config[env];
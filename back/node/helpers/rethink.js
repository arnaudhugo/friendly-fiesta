'use strict';

const r         = require('rethinkdb');
const config    = require('../config/config');

module.exports.connect = function (req, res, next) {
    let count = 0;

    ( function _connect() {
        r.connect({ host: config.host, port: config.port, db: config.database }, (error, connection) => {
            if (error && error.name === 'ReqlDriverError' && error.message.indexOf('Could not connect') === 0 && ++count < 31) {
                console.log(error );
                setTimeout(_connect, 1000);
                return;
            }

            req._rdb = connection;
            next();
        });
    })();
};

module.exports.close = function (req, res, next) {
    req._rdb.close();
};

module.exports.setup = async function setup() {
    return new Promise((resolve, reject) => {
        r.connect({ host: config.host, port: config.port, db: config.database }, (error, connection) => {
            if (error && error.name === 'ReqlDriverError' && error.message.indexOf('Could not connect') === 0 && ++count < 31) {
                console.log(error);
                reject(error);
            }

            // Create DATABASE if not exist
            r.dbList()
                .contains(config.database)
                .do(databaseExists =>
                    r.branch(databaseExists, { dbs_created: 0 }, r.dbCreate(config.database))
                )
                .run(connection)
                .then(() => console.log('DB done'))
                .catch(error => reject(error));

            // const tableProject = r.table('project');
            const tableOptions = {
                primaryKey:'id',
                durability:'hard'
            };

            const table = r.table('project');
            r.tableList().contains('project')
                .do(r.branch(r.row, table, r.do(function() {
                    console.log('youhou')
                    return r.tableCreate('project', tableOptions)
                        .do(function() {
                            console.log('table done')
                            return table;
                        });
                })
            ));

            connection.close();
            resolve('');
        });
    });
};

// const setup = async function() {
//     const connection = r.connect({ host: config.host, port: config.port, db: config.database })
//     // , (error, connection) => {
//     //     if (error && error.name === 'ReqlDriverError' && error.message.indexOf('Could not connect') === 0 && ++count < 31) {
//     //         console.log(error);
//     //         return;
//     //     }

        
//     // });

//     // Create DATABASE if not exist
//     await r.dbList()
//         .contains(config.database)
//         .do(databaseExists =>
//             r.branch(databaseExists, { dbs_created: 0 }, r.dbCreate(config.database))
//         )
//         .run(connection)
//         .then(() => console.log('DB done'))
//         .catch(error => {
//             return
//         });

//     // const tableProject = r.table('project');
//     const tableOptions = {
//         primaryKey:'id',
//         durability:'hard'
//     };

//     const table = r.table('project');
//     await r.tableList().contains('project')
//         .do(r.branch(r.row, table, r.do(function() {
//             console.log('youhou')
//             return r.tableCreate('project', tableOptions)
//                 .do(function() {
//                     console.log('table done')
//                     return table;
//                 });
//         })
//     ));

//     connection.close();
// };

// module.exports.setup = setup;
    

    


    // const tableOptions = {
    //     primaryKey:'id',
    //     durability:'hard'
    // };
    // r.ensureTable('project', tableOptions);

    // const tableProject = r.table('project');
    // r.tableList().contains('project')
    //     .do(
    //         r.branch(r.row, tableProject, r.do(function() {
    //             return r.tableCreate('project', tableOptions).do(function() {
    //                 return tableProject;
    //             });
    //         }))
    //     );

// POSTGRE POOL
var { Pool } = require('pg');

module.exports = () => {
    // POOL CONFIG
    let pool = new Pool({
        user: 'olphjuyjqvnisj',
        password: 'f96d752fdfc95a69a897c614cc5b3979808c635b4a3d99462c0c4b2020820920',
        host: 'ec2-107-21-126-201.compute-1.amazonaws.com',
        port: 5432,
        database: 'd9hjes87348bmk',
        max: 20,
        idleTimeoutMillis: 30000,
        ssl: true
    });

    return pool;
};
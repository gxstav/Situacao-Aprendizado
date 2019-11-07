// AUTHENTICATION PACKAGES
var passport = require('passport'),
    jwt = require('jsonwebtoken'),
    passportJWT = require('passport-jwt'),
    // DATABASE POOL
    pool = require('../config/database')(),
    // AUTHENTICATION VALIDATION
    ExtractJwt = passportJWT.ExtractJwt,
    JwtStrategy = passportJWT.Strategy,
    // AUTHENTICATION OPTIONS
    jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: '9e37dee5ca3bac795fdfa654275d99af'
    };

module.exports = {
    // GET AUTHENTICATION
    get auth() {
        // STRATEGY
        strategy = new JwtStrategy(jwtOptions, (jwt_payload, next) => {
            // CONNECT
            pool.connect()
                .then(client => {
                    // QUERY
                    client.query('SELECT * FROM users WHERE user_id = $1', [jwt_payload._id])
                        .then(result => {
                            if (result.rowCount > 0) {
                                next(null, result.rows[0]);
                            } else {
                                next(null, false);
                            }
                        })
                        .catch(err => console.log(err.message))
                    // DISCONNECT
                    .finally(() => client.release());
                })
                .catch(err => console.log(err.message))
        });
        // PASSPORT
        passport.use(strategy);

        return {
            initialize() {
                return passport.initialize();
            },
            get authenticate() {
                return passport.authenticate('jwt', { session: false });
            }
        }
    },
    // LOGIN FUNCTION
    login(name, password, callback) {
        // CONNECT
        pool.connect()
            .then(client => {
                // QUERY
                client.query('SELECT * FROM users WHERE user_name = $1 AND user_password = MD5($2)', [name, password])
                    .then(result => {
                        // CHECK RESULT
                        if (result.rowCount > 0) {
                            let payload = { _id: result.rows[0].user_id },
                                token = jwt.sign(payload, jwtOptions.secretOrKey);
                            // CALLBACK IF USER EXIST
                            callback({ id: payload._id, token });
                        } else {
                            // CALLBACK IF USER NOT EXIST
                            callback(false);
                        }
                    })
                    .catch(err => console.log(err.message))
                // DISCONNECT
                .finally(() => client.release());
            })
            .catch(err => console.error(err.message));
    }
};
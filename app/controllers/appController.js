// LOGIN FUNCTION
var login = require('../../config/auth').login,
    // DATABASE POOL
    pool = require('../../config/database')(),
    // NODEMAILER TRANSPORTER
    transporter = require('../../config/mailer')();

module.exports = () => {
    // CONTROLLER
    let controller = {
        // LOGIN
        userLogin(req, res) {
            // USER DATA
            let jsonData = req.body;
            login(jsonData.name, jsonData.password, result => {
                // CHECK RESULT
                if (result) {
                    res.send(result);
                }
                // ON ERROR => RESPONSE UNAUTHORIZED 401
                else {
                    res.status(401).json({ message: 'Erro de Autenticação' });
                }
            });
        },
        // GET USERS FUNCTION => /available = post
        isAvailable(req, res) {
            // USER DATA
            let jsonData = req.body,
                // RESPONSE TEMPLATE
                respTemplate = [];
            // CONNECTING TO THE DATABASE
            pool.connect()
                // ON SUCCESS => CONNECTED
                .then(client => {
                    // SELECT QUERY => CHECK IF user_name IS UNIQUE
                    client.query("SELECT * FROM users WHERE user_name = $1", [jsonData.name])
                        // ON SUCCESS
                        .then(result => {
                            // IF NOT UNIQUE respTemplate PUSH A MESSAGE
                            if (result.rowCount > 0) {
                                respTemplate.push('O nome de usuário já está em uso');
                            }
                            // SELECT QUERY => CHECK IF user_email IS UNIQUE
                            client.query("SELECT * FROM users WHERE user_email = $1", [jsonData.email])
                                // ON SUCCESS
                                .then(result => {
                                    // IF NOT UNIQUE respTemplate PUSH A MESSAGE
                                    if (result.rowCount > 0) {
                                        respTemplate.push('O e-mail já está em uso');
                                    }
                                    // RESPONSE OK 200
                                    res.status(200).json({ respTemplate });
                                })
                                // ON ERROR => RESPONSE BAD REQUEST 400
                                .catch(err => res.status(400).json({ message: err.message }))
                                // DISCONNECTING TO THE DATABASE
                                .finally(() => client.release());
                        })
                        // ON ERROR => RESPONSE BAD REQUEST 400
                        .catch(err => {
                            res.status(400).json({ message: err.message });
                            // DISCONNECTING TO THE DATABASE
                            client.release();
                        })
                })
                // ON ERROR => RESPONSE BAD REQUEST 400
                .catch(err => res.status(400).json({ message: err.message }));
        },
        // CREATE A NEW USER FUNCTION => /register => post
        createUser(req, res) {
            // USER DATA
            let jsonData = req.body,
                _latLng = jsonData.coordinates.split(','),
                latLng = `${_latLng[1]} ${_latLng[0]}`;
            // CONNECTING TO THE DATABASE
            pool.connect()
                // ON SUCCESS => CONNECTED
                .then(client => {
                    // INSERT QUERY => CREATE A NEW USER
                    client.query(`INSERT INTO users (user_name, user_password, user_email, user_address, user_coordinates, geom) VALUES($1, MD5($2), $3, $4, $5, ST_GeomFromText('Point(${latLng})',4326))`, [jsonData.name, jsonData.password, jsonData.email, jsonData.address, jsonData.coordinates])
                        // ON SUCCESS => RESPONSE OK 200
                        .then(() => res.status(200).json({ title: 'Obrigado por se cadastrar', message: 'Seus dados foram cadastrados com sucesso.' }))
                        // ON ERROR => RESPONSE BAD REQUEST 400
                        .catch(err => res.status(400).json({ message: err.message }))
                        // DISCONNECTING TO THE DATABASE
                        .finally(() => client.release());
                })
                // ON ERROR => RESPONSE BAD REQUEST 400
                .catch(err => res.status(400).json({ message: err.message }));
        },
        // CHECK IF THE user_email EXISTS => /registered => post
        isRegistered(req, res) {
            // USER DATA
            let jsonData = req.body,
                // RESPONSE TEMPLATE
                respTemplate = [];
            // CONNECTING TO THE DATABASE
            pool.connect()
                // ON SUCCESS => CONNECTED
                .then(client => {
                    // SELECT QUERY => CHECK IF THE user_email EXISTS
                    client.query("SELECT * FROM users WHERE user_email = $1", [jsonData.email])
                        // ON SUCCESS
                        .then(result => {
                            // IF THE user_email NOT EXISTS
                            if (result.rowCount === 0) {
                                respTemplate.push('O e-mail informado não está cadastrado');
                            }
                            // RESPONSE OK 200
                            res.status(200).json({ respTemplate });
                        })
                        // ON ERROR => RESPONSE BAD REQUEST 400
                        .catch(err => res.status(400).json({ message: err.message }))
                        // DISCONNECTING TO THE DATABASE
                        .finally(() => client.release());
                })
                // ON ERROR => RESPONSE BAD REQUEST 400
                .catch(err => res.status(400).json({ message: err.message }));
        },
        // RECOVER USER => /recover => post
        recoverUser(req, res) {
            // USER DATA
            let jsonData = req.body,
                // RANDOM PASSWORD
                new_password = Math.random().toString(36).substring(2, 10);
            // CONNECTING TO THE DATABASE
            pool.connect()
                // ON SUCCESS => CONNECTED
                .then(client => {
                    // UPDATE QUERY => UPDATE USER PASSWORD
                    client.query("UPDATE users SET user_password = MD5($1) WHERE user_email = $2", [new_password, jsonData.email])
                        // ON SUCCESS
                        .then(() => {
                            client.query("SELECT user_name FROM users WHERE user_email = $1", [jsonData.email])
                                .then(result => {
                                    // E-MAIL OPTIONS
                                    let mailOptions = {
                                        from: 'app.petresgate@gmail.com',
                                        to: jsonData.email,
                                        subject: 'PET RESGATE - Recuperação de Cadastro',
                                        text: `Esta é uma mensagem automática por favor não responda.\n\nVocê solicitou uma recuperação de cadastro para o app PET RESGATE. Os dados cadastrados para este e-mail são:\n\nNome de usuário: ${result.rows[0].user_name}\nSenha: ${new_password}\n\nAtenciosamente,\nPET RESGATE`
                                    };
                                    // E-MAIL FUNCTION
                                    transporter.sendMail(mailOptions, error => {
                                        if (error) {
                                            // ON ERROR => RESPONSE BAD REQUEST 400
                                            res.status(400).json({ message: error });
                                        } else {
                                            // RESPONSE OK 200
                                            res.status(200).json({ title: 'Por favor verifique seu e-mail', message: 'Os seus dados de cadastro foram atualizados e enviados para o seu e-mail.' });
                                        }
                                    });
                                })
                                // ON ERROR => RESPONSE BAD REQUEST 400
                                .catch(err => res.status(400).json({ message: err.message }))
                                // DISCONNECTING TO THE DATABASE
                                .finally(() => client.release());
                        })
                        // ON ERROR => RESPONSE BAD REQUEST 400
                        .catch(err => {
                            res.status(400).json({ message: err.message })
                            // DISCONNECTING TO THE DATABASE
                            client.release();
                        })
                })
                // ON ERROR => RESPONSE BAD REQUEST 400
                .catch(err => res.status(400).json({ message: err.message }))
        },
        // CHECK IF THE TOKEN IS VALID => /authenticated => get
        isAuthenticated(req, res) {
            // CONNECTING TO THE DATABASE
            pool.connect()
                // ON SUCCESS => CONNECTED
                .then(client => {
                    // SELECT QUERY
                    client.query("SELECT NOW()")
                        // ON SUCCESS
                        .then(() => res.status(200).json({ authenticated: true }))
                        // ON ERROR => RESPONSE BAD REQUEST 400
                        .catch(err => res.status(400).json({ message: err.message }))
                        // DISCONNECTING TO THE DATABASE
                        .finally(() => client.release());
                })
                // ON ERROR => RESPONSE BAD REQUEST 400
                .catch(err => res.status(400).json({ message: err.message }));
        },
        // GET USER DATA => /data:id => get
        getUser(req, res) {
            // USER ID
            let id = req.params.id,
                // RESPONSE TEMPLATE
                respTemplate = {};
            // CONNECTING TO THE DATABASE
            pool.connect()
                // ON SUCCESS => CONNECTED
                .then(client => {
                    // SELECT QUERY
                    client.query("SELECT * FROM users WHERE user_id = $1", [id])
                        // ON SUCCESS
                        .then(result => {
                            respTemplate = {
                                name: result.rows[0].user_name.trim(),
                                email: result.rows[0].user_email.trim(),
                                address: result.rows[0].user_address.trim(),
                                coordinates: result.rows[0].user_coordinates.trim()
                            };
                            // RESPONSE OK 200
                            res.status(200).json({ respTemplate });
                        })
                        // ON ERROR => RESPONSE BAD REQUEST 400
                        .catch(err => res.status(400).json({ message: err.message }))
                        // DISCONNECTING TO THE DATABASE
                        .finally(() => client.release());
                })
                // ON ERROR => RESPONSE BAD REQUEST 400
                .catch(err => res.status(400).json({ message: err.message }));
        },
        // UPDATE USER PASSWORD => /password => put
        setUserPassword(req, res) {
            // PASSWORD DATA
            let jsonData = req.body;
            // CONNECTING TO THE DATABASE
            pool.connect()
                // ON SUCCESS => CONNECTED
                .then(client => {
                    // UPDATE QUERY
                    client.query("UPDATE users SET user_password = MD5($1) WHERE user_id = $2", [jsonData.new, jsonData.id])
                        // ON SUCCESS
                        .then(() => {
                            // RESPONSE OK 200
                            res.status(200).json({ title: 'Senha atualizada', message: 'Sua senha foi atualizada com sucesso.' })
                        })
                        // ON ERROR => RESPONSE BAD REQUEST 400
                        .catch(err => res.status(400).json({ message: err.message }))
                        // DISCONNECTING TO THE DATABASE
                        .finally(() => client.release());
                })
                // ON ERROR => RESPONSE BAD REQUEST 400
                .catch(err => res.status(400).json({ message: err.message }));
        },
        // GET USER DATA => /data:user => get
        setUserData(req, res) {
            // PASSWORD DATA
            let jsonData = req.body,
                _latLng = jsonData.coordinates.split(','),
                latLng = `${_latLng[1]} ${_latLng[0]}`;
            // CONNECTING TO THE DATABASE
            pool.connect()
                // ON SUCCESS => CONNECTED
                .then(client => {
                    // UPDATE QUERY
                    client.query(`UPDATE users SET user_address = $1, user_coordinates = $2, geom = ST_GeomFromText('Point(${latLng})',4326) WHERE user_id = $3`, [jsonData.address, jsonData.coordinates, jsonData.id])
                        // ON SUCCESS
                        .then(() => {
                            // RESPONSE OK 200
                            res.status(200).json({ title: 'Dados atualizados', message: 'Seus dados foram atualizados com sucesso.' })
                        })
                        // ON ERROR => RESPONSE BAD REQUEST 400
                        .catch(err => res.status(400).json({ message: err.message }))
                        // DISCONNECTING TO THE DATABASE
                        .finally(() => client.release());
                })
                // ON ERROR => RESPONSE BAD REQUEST 400
                .catch(err => res.status(400).json({ message: err.message }));
        },
        // CREATE A NEW PET FUNCTION => /addveh => post
        createVeh(req, res) {
            // USER DATA
            let jsonData = req.body,
                _latLng = jsonData.coordinates.split(','),
                latLng = `${_latLng[1]} ${_latLng[0]}`;
            // CONNECTING TO THE DATABASE
            pool.connect()
                // ON SUCCESS => CONNECTED
                .then(client => {
                    // INSERT QUERY => CREATE A NEW USER
                    client.query(`INSERT INTO vehicle (user_id, vehicle_brand, vehicle_name, vehicle_year, vehicle_color, vehicle_type, vehicle_value, vehicle_status, vehicle_km, vehicle_fuel, vehicle_address, vehicle_coordinates) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ST_GeomFromText('Point(${latLng})',4326), NOW(), $11, $12)`, [jsonData.userId, jsonData.nickname, jsonData.type, jsonData.color, jsonData.injured, jsonData.sick, jsonData.fed, jsonData.description, jsonData.address, jsonData.coordinates, jsonData.picture, jsonData.status])
                        // ON SUCCESS => RESPONSE OK 200
                        .then(() => res.status(200).json({ title: 'Obrigado por ajudar', message: 'O animal foi cadastrado com sucesso.' }))
                        // ON ERROR => RESPONSE BAD REQUEST 400
                        .catch(err => res.status(400).json({ message: err.message }))
                        // DISCONNECTING TO THE DATABASE
                        .finally(() => client.release());
                })
                // ON ERROR => RESPONSE BAD REQUEST 400
                .catch(err => res.status(400).json({ message: err.message }));
        },
        // GET PET DATA => /veh:id => get
        getVeh(req, res) {
            // VEHICLE ID
            let id = req.params.id,
                // RESPONSE TEMPLATE
                respTemplate = {};
            // CONNECTING TO THE DATABASE
            pool.connect()
                // ON SUCCESS => CONNECTED
                .then(client => {
                    // SELECT QUERY
                    client.query("SELECT * FROM vehicles WHERE vehicle_id = $1", [id])
                        // ON SUCCESS
                        .then(result => {
                            respTemplate = {
                                petId: result.rows[0].pet_id,
                                nickname: result.rows[0].pet_nickname.trim(),
                                type: result.rows[0].pet_type.trim(),
                                color: result.rows[0].pet_color.trim(),
                                injured: result.rows[0].pet_injured,
                                sick: result.rows[0].pet_sick,
                                fed: result.rows[0].pet_fed,
                                description: result.rows[0].pet_description.trim(),
                                address: result.rows[0].pet_address.trim(),
                                coordinates: result.rows[0].pet_coordinates.trim(),
                                date: result.rows[0].pet_date,
                                picture: result.rows[0].pet_picture
                            };
                            // RESPONSE OK 200
                            res.status(200).json({ respTemplate });
                        })
                        // ON ERROR => RESPONSE BAD REQUEST 400
                        .catch(err => res.status(400).json({ message: err.message }))
                        // DISCONNECTING TO THE DATABASE
                        .finally(() => client.release());
                })
                // ON ERROR => RESPONSE BAD REQUEST 400
                .catch(err => res.status(400).json({ message: err.message }));
        },
        // GET PETS DATA => /pets => get
        getVehicles(req, res) {
            // RESPONSE TEMPLATE
            let respTemplate = [];
            // CONNECTING TO THE DATABASE
            pool.connect()
                // ON SUCCESS => CONNECTED
                .then(client => {
                    // SELECT QUERY
                    client.query("SELECT * FROM vehicles WHERE vehicle_status[1] = 0 ORDER BY pet_date")
                        // ON SUCCESS
                        .then(result => {
                            result.rows.map(item => {
                                respTemplate.push({
                                    petId: item.pet_id,
                                    nickname: item.pet_nickname.trim(),
                                    type: item.pet_type.trim(),
                                    coordinates: item.pet_coordinates.trim(),
                                    date: item.pet_date
                                });
                            });
                            // RESPONSE OK 200
                            res.status(200).json({ respTemplate });
                        })
                        // ON ERROR => RESPONSE BAD REQUEST 400
                        .catch(err => res.status(400).json({ message: err.message }))
                        // DISCONNECTING TO THE DATABASE
                        .finally(() => client.release());
                })
                // ON ERROR => RESPONSE BAD REQUEST 400
                .catch(err => res.status(400).json({ message: err.message }));
        },
        // UPDATE PET STATUS => /rescue => put
        rescue(req, res) {
            // DATA
            let jsonData = req.body;
            // CONNECTING TO THE DATABASE
            pool.connect()
                // ON SUCCESS => CONNECTED
                .then(client => {
                    // UPDATE QUERY
                    client.query("UPDATE pets SET pet_status = $1 WHERE pet_id = $2", [jsonData.status, jsonData.petId])
                        // ON SUCCESS
                        .then(() => {
                            // RESPONSE OK 200
                            res.status(200).json({ title: 'Resgate', message: 'O resgate do animal foi registrado com sucesso, muito obrigado por ajudar.' })
                        })
                        // ON ERROR => RESPONSE BAD REQUEST 400
                        .catch(err => res.status(400).json({ message: err.message }))
                        // DISCONNECTING TO THE DATABASE
                        .finally(() => client.release());
                })
                // ON ERROR => RESPONSE BAD REQUEST 400
                .catch(err => res.status(400).json({ message: err.message }));
        },
        // FILTER PETS => /filter => post
        filter(req, res) {
            // USER DATA
            let jsonData = req.body,
                _latLng = jsonData.coordinates.split(','),
                latLng = `${_latLng[1]} ${_latLng[0]}`,
                // RESPONSE TEMPLATE
                respTemplate = [];
            // CONNECTING TO THE DATABASE
            pool.connect()
                // ON SUCCESS => CONNECTED
                .then(client => {
                    // INSERT QUERY => CREATE A NEW USER
                    client.query(`SELECT * FROM pets WHERE pet_status[1] = 0 AND ST_Intersects(geom,ST_Buffer(ST_GeomFromText('Point(${latLng})',4326),$1)) AND pet_type = $2`, [jsonData.distance, jsonData.type])
                        // ON SUCCESS
                        .then(result => {
                            result.rows.map(item => {
                                respTemplate.push({
                                    petId: item.pet_id,
                                    nickname: item.pet_nickname.trim(),
                                    type: item.pet_type.trim(),
                                    coordinates: item.pet_coordinates.trim(),
                                    date: item.pet_date
                                });
                            });
                            // RESPONSE OK 200
                            res.status(200).json({ respTemplate });
                        })
                        // ON ERROR => RESPONSE BAD REQUEST 400
                        .catch(err => res.status(400).json({ message: err.message }))
                        // DISCONNECTING TO THE DATABASE
                        .finally(() => client.release());
                })
                // ON ERROR => RESPONSE BAD REQUEST 400
                .catch(err => res.status(400).json({ message: err.message }));
        }
    };

    return controller;
};
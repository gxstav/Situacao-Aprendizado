// GET AUTHENTICATION
var auth = require('../../config/auth').auth;

module.exports = app => {
    // CONTROLLER
    let controller = app.controllers.appController;
    // APP ROUTERS
    app
        // CHECK IF THE user_name AND THE user_password EXISTS ? {'user', 'token'} : {'message'}
        .post('/login', controller.userLogin)
        // CHECK IF THE user_name AND THE user_email IS AVAILABLE ? {[respTemplate]} : {'message'}
        .post('/available', controller.isAvailable)
        // CREATE A NEW USER ? {'title', 'message'} : {'message'}
        .post('/register', controller.createUser)
        // CHECK IF THE user_email EXISTS ? {[respTemplate]} : {'message'}
        .post('/registered', controller.isRegistered)
        // UPDATE THE user_password AND SEND AN EMAIL WITH THE user_name AND THE user_password ? {'title', 'message'} : {'message'}
        .post('/recover', controller.recoverUser)
        // CHECK IF THE TOKEN IS VALID ? {bool} : {'message'}
        .get('/authenticated', auth.authenticate, controller.isAuthenticated)
        // GET THE user_name, user_email AND user_address ? {{respTemplate}} : {'message'}
        .get('/data/:id', auth.authenticate, controller.getUser)
        // UPDATE THE user_password ? {'title', 'message'} : {'message'}
        .put('/password', auth.authenticate, controller.setUserPassword)
        // UPDATE THE user_name, user_email AND user_address ? {'title', 'message'} : {'message'}
        .put('/data', auth.authenticate, controller.setUserData)
        // CREATE A NEW VEHICLE ? {'title', 'message'} : {'message'}
        .post('/addVehicle', auth.authenticate, controller.createVehicle)
        // GET PET BY ID ? {{respTemplate}} : {'message'}
        .get('/vehicle/:id', auth.authenticate, controller.getVehicle)
        // GET ALL VEHICLES ? {{respTemplate}} : {'message'}
        .get('/vehicles', auth.authenticate, controller.getVehicles)
        // UPDATE THE vehicle_status ? {'title', 'message'} : {'message'}
        .put('/rescue', auth.authenticate, controller.rescue)
        // GET ALL FILTERED VEHICLES ? {{respTemplate}} : {'message'}
        .post('/filter', auth.authenticate, controller.filter)
};
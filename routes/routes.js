'use strict';
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
// const cors = require('cors');

// cors setup 
// var corsOptions = {
//   origin: 'https://react-redux-auth-frontend-codemzy.c9users.io'
// };

// get db connection 
const db = require('../server').db;

module.exports = function (app) {
    
    // controllers
    const Authentication = require('../controllers/authentication');
    // services
    const passport = require('passport');
    require('../services/passport.js')(db); // this needs to be run but is not directly referenced in this file
    
    // session false as we are not using cookies, using tokens
    const requireAuth = passport.authenticate('jwt', { session: false });
    const requireSignIn = passport.authenticate('local', { session: false });
    
    // allow requests from cross origin
    // app.use(cors(corsOptions));
    
    // USER ROUTES
    var userRoutes = require('./user_routes');
    app.use('/user', userRoutes);
    
    // PROTECTED ROUTES
    
    // ANON ROUTES
        
    // protected route
    app.route('/protected')
        .get(requireAuth, function(req, res) {
            res.send({ message: 'Authenticated' });
        });
};
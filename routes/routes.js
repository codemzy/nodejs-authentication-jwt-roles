'use strict';
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const cors = require('cors');

// cors setup 
// var corsOptions = {
//   origin: 'https://react-redux-auth-frontend-codemzy.c9users.io'
// };

module.exports = function (app, db) {
    
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
    
    // take user data and create user in DB
    app.route('/signup')
        // to recieve post requests from signup form
        .post(jsonParser, Authentication.signup);
        
    // take user data and create user in DB
    app.route('/signin')
        // to recieve post requests from signup form
        .post(jsonParser, requireSignIn, Authentication.signin);
        
    // protected route
    app.route('/protected')
        .get(requireAuth, function(req, res) {
            res.send({ message: 'Authenticated' });
        });
};
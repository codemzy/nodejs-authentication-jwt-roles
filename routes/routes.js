'use strict';
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
// const cors = require('cors');

// cors setup 
// var corsOptions = {
//   origin: 'https://react-redux-auth-frontend-codemzy.c9users.io'
// };

module.exports = function (app, db) {
    
    // controllers
    const Authentication = require('../controllers/authentication')(db);
    // services
    const passport = require('passport');
    require('../services/passport.js')(db); // this needs to be run but is not directly referenced in this file
    
    // session false as we are not using cookies, using tokens
    const requireAuth = passport.authenticate('jwt', { session: false });
    const requireSignIn = passport.authenticate('local', { session: false });
    
    // allow requests from cross origin
    // app.use(cors(corsOptions));
    
    // SIGN UP
    // take user data and create user in DB
    app.route('/signup')
        // to recieve post requests from signup form
        .post(jsonParser, Authentication.signup);
    
    // SIGN IN    
    // take user data and check user exists in DB
    app.route('/signin')
        // to recieve post requests from signin form
        .post(jsonParser, requireSignIn, Authentication.signin);
        
    // FORGOT PASSWORD
    // check user email exists in DB
    app.route('/forgotten')
        // to recieve post requests from forgotton pw form
        .post(jsonParser, Authentication.forgotpw);
        
    // protected route
    app.route('/protected')
        .get(requireAuth, function(req, res) {
            res.send({ message: 'Authenticated' });
        });
};
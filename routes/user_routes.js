var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

// get db connection 
const db = require('../server').db;

// controllers
const Authentication = require('../controllers/authentication')(db);
// services
const passport = require('passport');
require('../services/passport.js')(db); // this needs to be run but is not directly referenced in this file

// session false as we are not using cookies, using tokens
const requireSignIn = passport.authenticate('local', { session: false });

// ROUTES -----------------------------------------------------

// SIGN UP
// take user data and create user in DB
router.post('/signup', jsonParser, Authentication.signup);

// SIGN IN    
// take user data and check user exists in DB
router.post('/signin', jsonParser, requireSignIn, Authentication.signin);
    
// FORGOT PASSWORD
// check user email exists in DB
router.post('/forgotten', jsonParser, Authentication.forgotpw);

module.exports = router;
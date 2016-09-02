const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

// const User = require('../models/user');

const bcrypt = require('bcrypt-nodejs');
require('dotenv').config();
const secret = process.env.SECRET_STR;

// bcrypt encrypts the provided password with the salt off the user.password, and sees if the 
// encrypted version of the provided password matches the stored encrypted password
const comparePassword = function(suppliedPassword, userPassword, callback) {
    bcrypt.compare(suppliedPassword, userPassword, function(err, isMatch) {
        if (err) {
            return callback(err);
        }
        callback(null, isMatch);
    });
};

module.exports = function (db) {

    // Create local strategy for signing in with username and password
    const localOptions = { usernameField: 'email' };
    const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
        // verify the email and password call done with user if correct
        // otherwise call done with false
        db.collection('users').findOne({ email: email }, function(err, user) {
            if (err) {
                return done(err, false);
            }
            // user not found - no record for email address
            if (!user) {
                return done(null, false);
            }
            // email found, compare passwords
            console.log(user.password); // TO REMOVE just checking if user.password returns the hashed password for comparing
            comparePassword(password, user.password, function(err, isMatch) {
                if (err) {
                    return done(err);
                }
                if (!isMatch) {
                    return done(null, false);
                }
                return done(null, user);
            });
        });
        
    });
    
    // Set up options for JWT strategy
    const jwtOptions = {
        // look in the header of the request for the token
        jwtFromRequest: ExtractJwt.fromHeader('authorization'),
        // decode with the secret
        secretOrKey: secret
    };
    
    // Create JWT strategy
    // payload is the token (sub) and timestamp (iat)
    const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
        // see if the user ID in the payload exists in our database
        // if it does call done with that user
        // otherwise call done without a user object
        db.collection('users').findById(payload.sub, function(err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        });
    });
    
    // Tell passport to use this strategy
    passport.use(jwtLogin);
    passport.use(localLogin);

};

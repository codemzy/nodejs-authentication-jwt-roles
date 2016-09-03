'use strict';

const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');

require('dotenv').config();
const secret = process.env.SECRET_STR;

function tokenForUser(user) {
    const timestamp = new Date().getTime();
    const expireTime = timestamp + (1000 * 60 * 60 * 24 * 7); // expires in 7 days
    // the subject (sub) of this token is the user id, iat = issued at time, exp = expiry time
    return jwt.encode({ sub: user.id, iat: timestamp, exp: expireTime }, secret);
}

function hashPassword(password, callback) {
    // generate a salt then run callback
    bcrypt.genSalt(10, function(err, salt) {
        if (err) {
            return callback(err);
        }
        // hash (encrypt) the password using the salt then run callback
        bcrypt.hash(password, salt, null, function(err, hash) {
            if (err) {
                return callback(err);
            }
            // overwrite plain text password with encrypted password
            callback(null, hash);
        });
    });
}

module.exports = function (db) {
    
    const module = {};

    module.signup = function(req, res, next) {
        const EMAIL = req.body.email;
        const PASSWORD = req.body.password;
        // check if any data missing
        if (!EMAIL || !PASSWORD) {
            return res.status(422).send({ error: 'You must provide email and password'});
        }
        // See if a user with the given email exists
        db.collection('users').findOne({ email: EMAIL }, function(err, existingUser) {
            if (err) {
                return next(err);
            }
            // If a user with the email does exist, return an error
            if (existingUser) {
                return res.status(422).send({ error: 'Email is in use'});
            }
            // If a user with email does not exist, hash passord
            hashPassword(PASSWORD, function(err, hash) {
                if (err) {
                    return next(err);
                }
                // create and save user record
                const USER = {
                    email: EMAIL,
                    password: hash
                };
                // save the user we just created
                db.collection('users').insertOne(USER, function(err, result) {
                    if (err) {
                        return next(err);
                    }
                    // Respond to request indicating the user was created
                    res.json({ token: tokenForUser({ id: result.insertedId }) });
                });
            });
        });
    };
    
    module.signin = function(req, res, next) {
        // User has already had their email and password auth'd we just need to give them a token
        res.send({ token: tokenForUser({ id: req.user._id }) });
    };
    
    return module;


};
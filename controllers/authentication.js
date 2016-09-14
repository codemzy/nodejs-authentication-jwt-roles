'use strict';

const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');

require('dotenv').config();
const secret = process.env.SECRET_STR;

// get db connection 
const db = require('../server').db;

// get email services
const email = require('../services/sparkpost');

// get validation functions
const validate = require('./validate');

// create token
function tokenForUser(user) {
    const timestamp = new Date().getTime();
    const expireTime = timestamp + (1000 * 60 * 60 * 24 * 7); // expires in 7 days
    // the subject (sub) of this token is the user id, iat = issued at time, exp = expiry time
    return jwt.encode({ sub: user.id, iat: timestamp, exp: expireTime }, secret);
}

// hash password
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

// create link code 
// for confirming email and forgotten passwords
function createLinkCode(type) {
    // timestamp so can check age and random number to create linkCode
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 10000);
    const linkCode = timestamp + '-' + randomNum + '-' + type;
    return linkCode;
}

// check link codes are valid
function checkCodeTime(linkCode) {
    const tokenArr = linkCode.split("-");
    const timestamp = tokenArr[0];
    const now = new Date().getTime();
    const difference = timestamp - now;
    // default to 1 hour
    let timeLeft = Math.floor(difference / 1000 / 60) + 60;
    // if email confirmation expire in 24 hours
    if (tokenArr[2] === "ecc") {
        timeLeft = Math.floor(difference / 1000 / 60) + 60 * 24;
    }
    if (timeLeft < 1) {
        // expired
        return false;
    } else {
        // valid
        return timeLeft;
    }
}

exports.signup = function(req, res, next) {
    const EMAIL = req.body.email;
    const PASSWORD = req.body.password;
    // check if any data missing
    if (!EMAIL || !PASSWORD) {
        return res.status(422).send({ error: 'You must provide email and password'});
    }
    // check if email is a string and a valid email format
    if (!validate.checkString(EMAIL) || !validate.checkEmail(EMAIL)) {
        return res.status(422).send({ error: 'Email is not valid'});
    }
    // check if password is a string
    if (!validate.checkString(PASSWORD)) {
        return res.status(422).send({ error: 'Password is not valid'});
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
            // create email confirm code
            const emailConfirmCode = createLinkCode("ecc");
            // create and save user record
            const USER = {
                email: EMAIL,
                password: hash,
                emailConfirmed: false,
                emailConfirmCode: emailConfirmCode
            };
            // save the user we just created
            db.collection('users').insertOne(USER, function(err, result) {
                if (err) {
                    return next(err);
                }
                // Send a welcome email
                email.welcomeEmail(EMAIL, emailConfirmCode);
                // Respond to request indicating the user was created
                res.json({ token: tokenForUser({ id: result.insertedId }) });
            });
        });
    });
};

exports.signin = function(req, res, next) {
    // User has already had their email and password auth'd we just need to give them a token
    res.send({ token: tokenForUser({ id: req.user._id }) });
};

// TO DO VALIDATE EMAIL
exports.emailConfirm = function(req, res, next) {
    const emailToken = req.params.emailToken;
    // User is already signed in so we just need to check the emailToken matches their token
    const USER = req.user._id;
    // TO FIRST actually issue a token when they sign up
    // TO DO check token is valid
    // TO DO look up user, check matches
    res.send({ message: USER });
};

exports.forgotpw = function(req, res, next) {
    const EMAIL = req.body.email;
    // check if any data missing
    if (!EMAIL || !validate.checkString(EMAIL)) {
        return res.status(422).send({ error: 'You must provide a valid email address'});
    }
    // See if a user with the given email exists
    db.collection('users').findOne({ email: EMAIL }, function(err, existingUser) {
        if (err) {
            return next(err);
        }
        // If a user with the email does exist, send an email with a reset password link
        // link expires after an hour, add a token to the user in the DB and this needs to match the token and email and not be expired
        if (existingUser) {
            // create linkCode for pw reset
            const resetToken = createLinkCode("pwr");
            // add to db
            db.collection('users').updateOne({ email: EMAIL }, { $set: { "resetPassword" : resetToken } }, function(err, updated) {
                if (err) {
                    return next(err);
                }
                // SEND VIA EMAIL TO DO
                email.forgotPasswordEmail(EMAIL, resetToken, function(err, success) {
                    if (err) {
                        return next(err);
                    }
                    return res.send({ message: 'User found and email sent', reset: resetToken });
                });
            });
        } else {
            // email does not exist, return an error
            return res.status(422).send({ error: 'Email does not exist'});
        }
    });
};

exports.resetCheck = function(req, res, next) {
    const resetToken = req.params.resetToken;
    const timeLeft = checkCodeTime(resetToken);
    if (!timeLeft) {
        // TOKEN NOT VALID
        return res.status(422).send({ error: 'Reset link has expired'});
    } else {
        return res.send({ message: 'Reset link valid', timeleft: timeLeft });
    }
    
};

exports.resetpw = function(req, res, next) {
    const EMAIL = req.body.email;
    const PASSWORD = req.body.password;
    const RESET_TOKEN = req.body.reset;
    // check if any data missing
    if (!EMAIL || !PASSWORD) {
        return res.status(422).send({ error: 'You must provide email and new password'});
    }
    // check if reset token time is still valid
    if (!RESET_TOKEN || !checkCodeTime(RESET_TOKEN)) {
        return res.status(422).send({ error: 'Your forgotten password link has expired, you must use the link within 1 hour'});
    }
    // check if email is a string and a valid email format
    if (!validate.checkString(EMAIL) || !validate.checkEmail(EMAIL)) {
        return res.status(422).send({ error: 'Email is not valid'});
    }
    // check if password is a string
    if (!validate.checkString(PASSWORD)) {
        return res.status(422).send({ error: 'Password is not valid'});
    }
    // See if a user with the given email exists
    db.collection('users').findOne({ email: EMAIL }, function(err, existingUser) {
        if (err) {
            return next(err);
        }
        // If a user with the email does not exist, return an error
        if (!existingUser) {
            return res.status(422).send({ error: 'Email not found'});
        }
        // If the reset link doesn't match, return an error
        if (existingUser.resetPassword !== RESET_TOKEN) {
            return res.status(422).send({ error: 'Reset link not valid'});
        }
        // If a user with email does exist and reset matches, hash new passord
        hashPassword(PASSWORD, function(err, hash) {
            if (err) {
                return next(err);
            }
            // new password hash
            const passwordHash = hash;
            // update to db
            db.collection('users').updateOne({ email: EMAIL }, { $set: { "password" : passwordHash }, $unset: { "resetPassword": "" } }, function(err, updated) {
                if (err) {
                    return next(err);
                }
                // Respond to request with a token now password is updated user is logged in
                return res.json({ token: tokenForUser({ id: existingUser._id }) });
            });
        });
    });
};


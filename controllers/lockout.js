'use strict';

// get db connection 
const db = require('../server').db;

// check if user is locked out of account
exports.checkLockOut = function(time) {
    // if no time then no lockout
    if (!time) {
        return false;
    }
    // otherwise, check if the time of lock out is less than 60 mins ago
    const now = new Date().getTime();
    const difference = time - now;
    let timeLeft = Math.floor(difference / 1000 / 60) + 60;
    if (timeLeft < 1) {
        // lock out has expired
        return false;
    } else {
        // lock out still active
        return true;
    }
};

// add a failed log in attempt to account
exports.failedLogIn = function(ip, user, callback) {
    const NOW = new Date().getTime();
    const FAIL_OBJ = { "time": NOW, "ip": ip };
    let lockObj = {
        lockedOut: false,
        fails: user.lockOut.fails || []
    };
    // push this fail onto the fails array
    lockObj.fails.push(FAIL_OBJ);
    // if more than 5 fails
    if (lockObj.fails.length > 5) {
        let validFails = lockObj.fails.filter((fail) => {
            return this.checkLockOut(fail.time);
        }); 
        lockObj.fails = validFails;
        if (validFails.length > 9) {
            lockObj.lockedOut = true;
            lockObj.time = NOW;
        } 
    }
    // update to db
    db.collection('users').updateOne({ email: user.email }, { $set: { "lockOut" : lockObj } }, function(err, updated) {
        if (err) {
            return callback();
        }
        // Callback indicating if user now locked out
        return callback();
    });
}.bind(this);



            
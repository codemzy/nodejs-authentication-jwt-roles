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
    let lockObj = {};
    // if this is first failed attempt
    if (!user.lockOut) {
        lockObj.lockedOut = false;
        lockObj.fails = [FAIL_OBJ];
    }
    if (user.lockOut && user.lockOut.fails.length > 5) {
        let validFails = user.lockOut.filter.map((fail) => {
            return this.checkLockOut(fail.time);
        }); 
        validFails.push(FAIL_OBJ);
        lockObj.fails = validFails;
        if (validFails > 9) {
            lockObj.lockedOut = true;
            lockObj.time = NOW;
        } else {
            lockObj.lockedOut = false;
        }
    }
    // update to db
    db.collection('users').updateOne({ email: user.email }, { $set: { "lockOut" : lockObj } }, function(err, updated) {
        if (err) {
            return callback(err);
        }
        // Callback indicating if user now locked out
        return callback(null, lockObj.lockedOut);
    });
}.bind(this);



            
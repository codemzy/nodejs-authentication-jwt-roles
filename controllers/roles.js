'use strict';

// get db connection 
const db = require('../server').db;

// get validation functions
const validate = require('./validate');

// roles object
const ROLES = {
    1: "Manager",
    2: "User",
    3: "Trial"
};

exports.addRole = function(role, user, callback) {
    const NOW = new Date().getTime();
    let permissions = {
        updatedAt: NOW,
        roles: user.permissions.roles || []
    };
    // make sure the role is a number and exists in the roles object
    if (!role || !validate.checkNum(role) || !ROLES[role]) {
        // error
        return callback("Invalid user or role");
    }
    // check the user info is present and of valid types
    if (!user || !validate.checkEmail(user.email) || !validate.checkArr(permissions.roles)) {
        // error
        return callback("Invalid user or role");
    }
    // add the new role to the user roles
    permissions.roles.push(ROLES[role]);
    // update the db
    db.collection('users').updateOne({ email: user.email }, { $set: { "permissions" : permissions } }, function(err, updated) {
        if (err) {
            return callback(err);
        }
        // Callback with user roles
        return callback(null, permissions.roles);
    });
};
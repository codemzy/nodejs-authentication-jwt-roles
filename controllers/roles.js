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

// Add role and return new permissions object so we can update the DB later
// use this if have other updates to do to reduce calls to the DB
exports.addRole = function(role, user) {
    const NOW = new Date().getTime();
    let permissions = {
        updatedAt: NOW,
        roles: user.permissions && user.permissions.roles ? user.permissions.roles : []
    };
    // check the user info is present and of valid types
    if (!user || !validate.checkEmail(user.email) || !validate.checkArr(permissions.roles)) {
        // error - just return an empty object
        return {};
    }
    // make sure the role is a number and exists in the roles object
    if (!role || !validate.checkNum(role) || !ROLES[role]) {
        // error - just return existing permissions object
        return permissions;
    }
    // add the new role to the user roles
    permissions.roles.push(ROLES[role]);
    // return the callback with the new permissions object
    return permissions;
};

// Add role and update the DB
// Use this if no other updates to do for this user
exports.addRoleDB = function(role, user, callback) {
    const NOW = new Date().getTime();
    let permissions = {
        updatedAt: NOW,
        roles: user.permissions && user.permissions.roles ? user.permissions.roles : []
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
        // Callback with roles
        return callback(null, permissions.roles);
    });
};

exports.deleteRoleDB = function(role, user, callback) {
    const NOW = new Date().getTime();
    let permissions = {
        updatedAt: NOW,
        roles: user.permissions && user.permissions.roles ? user.permissions.roles : []
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
    // remove the role from the permissions object
    let newRoles = user.permissions.roles.filter((role) => {
        return role !== ROLES[role];
    });
    permissions.roles = newRoles;
    // update the db
    db.collection('users').updateOne({ email: user.email }, { $set: { "permissions" : permissions } }, function(err, updated) {
        if (err) {
            return callback(err);
        }
        // Callback with user roles
        return callback(null, permissions.roles);
    });
};
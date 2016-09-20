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

exports.addRole = function(role, callback) {
    // make sure the role is a number and exists in the roles object
    if (!validate.checkNum(role) || !ROLES[role]) {
        // error
        return callback("Invalid role");
    }
    
};
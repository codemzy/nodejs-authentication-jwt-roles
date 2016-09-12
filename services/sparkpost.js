require('dotenv').config();
const SPARKPOST_KEY = process.env.SPARKPOST_KEY;

var SparkPost = require('sparkpost');
var sp = new SparkPost(SPARKPOST_KEY);

const APP_NAME = 'My App';
const APP_EMAIL = 'testing@sparkpostbox.com';

exports.welcomeEmail = function (email) {
 
    sp.transmissions.send({
      transmissionBody: {
        content: {
          from: APP_EMAIL,
          subject: APP_NAME + ': Your new account',
          html:'<html><body><p>Hello and welcome to ' + APP_NAME + '!</p>\
          <p>Thanks so much for joining us.</p>\
          <p>You can login to your ' + APP_NAME + ' account right now to get started.</p>\
          <p>Have any questions? Just send us an email! We’re always here to help.</p>\
          <p>Support at ' + APP_NAME + '</p>\
          </body></html>'
        },
        recipients: [
          {address: email}
        ]
      }
    }, function(err, res) {
      if (err) {
        console.log('Whoops! Something went wrong with the welcomeEmail');
        console.log(err);
      }
    });

};


exports.forgotPasswordEmail = function (email, resetToken, callback) {
 
    sp.transmissions.send({
      transmissionBody: {
        content: {
          from: APP_EMAIL,
          subject: APP_NAME + ': Password Reset',
          html:'<html><body><p>Someone (hopefully you) requested a new password for the ' + APP_NAME + ' account for ' + email + '.</p>\
          <p>Use the link below to set up a new password for your account.</p>\
          <p>' + resetToken + '</p>\
          <p>This password reset is only valid for the next 60 minutes.</p>\
          <p>No changes have been made to your account, so if you don\'t want to change your password, or requested a new password in error, you don\'t need to take any action and can safely ignore this email.</p>\
          <p>Support at ' + APP_NAME + '</p>\
          </body></html>'
        },
        recipients: [
          {address: email}
        ]
      }
    }, function(err, res) {
      if (err) {
        console.log('Whoops! Something went wrong with the forgotPasswordEmail');
        callback(err);
      } else {
        callback(null, res);
      }
    });

};
require('dotenv').config();
const SPARKPOST_KEY = process.env.SPARKPOST_KEY;

var SparkPost = require('sparkpost');
var sp = new SparkPost(SPARKPOST_KEY);

const APP_NAME = 'My App';


exports.forgotPasswordEmail = function (email, resetToken, callback) {
 
    sp.transmissions.send({
      transmissionBody: {
        content: {
          from: 'testing@sparkpostbox.com',
          subject: 'App Name: Password Reset',
          html:'<html><body><p>Someone (hopefully you) requested a new password for the ' + APP_NAME + ' account for ' + email + '.</p>\
          <p>Use the link below to set up a new password for your account.</p>\
          <p>' + resetToken + '</p>\
          <p>This password reset is only valid for the next 60 minutes.</p>\
          <p>No changes have been made to your account, so if you don\'t want to change your password, or requested a new password in error, you don\'t need to take any action and can safely ignore this email.</p>\
          <p>Support at' + APP_NAME + '</p>\
          </body></html>'
        },
        recipients: [
          {address: email}
        ]
      }
    }, function(err, res) {
      if (err) {
        console.log('Whoops! Something went wrong with the forgotPasswordEmail');
        console.log(err);
      } else {
        console.log('Woohoo! You just sent your first mailing!');
        callback(res);
      }
    });

};
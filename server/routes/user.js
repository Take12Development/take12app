var express = require('express');
var router = express.Router();
var passport = require('passport');
var path = require('path');
var Chance = require('chance');
var chance = new Chance();
var fs = require('fs');
var moment = require('moment');
var Users = require('../models/user');
const sgMail = require('@sendgrid/mail');

if(process.env.SENDGRID_API_KEY != undefined) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  var jsonPath = path.join(__dirname, '..', 'conf', 'settings.json');
  var rawdata = fs.readFileSync(jsonPath);
  var configValues = JSON.parse(rawdata);

  sgMail.setApiKey(configValues.sendgrid.SENDGRID_API_KEY);
}

if(process.env.BASE_URL != undefined) {
  var baseURL = process.env.BASE_URL;
} else {
  var jsonPath = path.join(__dirname, '..', 'conf', 'settings.json');
  var rawdata = fs.readFileSync(jsonPath);
  var configValues = JSON.parse(rawdata);
  var baseURL = configValues.take12app.BASE_URL;
}

// Handles request for user information if user is authenticated
router.get('/', function(req, res) {
  // check if logged in
  if(req.isAuthenticated()) {
    // send back user object from database
    //prepare an object = { }
    res.send(req.user);
  } else {
    // failure best handled on the server. do redirect here.
    res.send(false);
  }
});

// clear all server session information about this user
router.get('/logout', function(req, res) {
  // Use passport's built-in method to log out the user
  console.log('Logged out');
  req.logOut();
  res.sendStatus(200);
});

// creates and sends a code to reset the password
router.post('/forgotpassword', function(req, res) {
  //pool of characters chance will select from to create random string
  var code = chance.string({
      pool: 'abcdefghijklmnopqrstuvwxyz1234567890',
      length: 20
  });
  Users.findOne({"email": req.body.email}, function(err, foundUser) {
    if (err) {
      console.log('PASSWORD RESET ERROR: ', err);
      res.sendStatus(500);
    }
    if (foundUser) {
      foundUser.code = code;
      var expireCode = moment().add(1, 'days').format();
      foundUser.expiration = expireCode;
      foundUser.save(function(err, savedUser) {
        if (err) {
          console.log('PASSWORD RESET ERROR: ', err);
          res.sendStatus(500);
        } else {
          var emailMessage = 'Reset your password here: ' + baseURL + '/#/confirmreset/' + code;
          // Mail out that link with sendgrid.
          var msg = {
            to: req.body.email,
            from: 'Take12 <admin@mytake12.com>',
            subject: 'Reset Password link',
            text: 'Reset your Take12 password. This link will expire in 24 hours.',
            html: emailMessage
          };
          sgMail.send(msg, function(err, result) {
            if (err) {
              console.log('PASSWORD RESET ERROR (Sendgrid):',err);
              res.send('Error sending email');
            } else {
              // message sent
              res.send("Code sent successfully.")
            }
          });
        }
      });

    } else { // no user found
      console.log('PASSWORD RESET ERROR (Sendgrid):',err);
      res.send('User not found.');
    }

  });
});

// resets password
router.put('/resetpassword', function(req, res) {
  Users.findOne({"email": req.body.email}, function(err, foundUser) { //getting ERR with User here
    if (err) {
      res.sendStatus(500);
    }
    var date = moment().format();
    foundUser.expiration = Date.now();
    if (req.body.code != foundUser.code) {
      res.sendStatus(500);
    }
    foundUser.password = req.body.password;
    foundUser.expiration = Date.now();
    foundUser.save(function(err, savedUser) {
      if (err) {
          console.log(err);
          res.sendStatus(500);
      } else {
        res.send("Password updated successfully.")
      }
    });
  });
});

// inserts user email address for facebook users
router.post('/updatefbuseremail', function(req, res) {
  Users.findOne({'facebookId': req.body.facebookId}, function(err, foundUser){
    if(err){
      console.log('Error finding user in claim',err);
    }
    if (foundUser) {
      foundUser.email = req.body.email;
      foundUser.save(function(err, savedUser){
        if(err){
          console.log('Error updating users table with facebook email', err);
        } else {
          res.send(savedUser);
        }
      });
    } else {
      res.send('There was a problem finding your user account');
    }
  });
});


module.exports = router;

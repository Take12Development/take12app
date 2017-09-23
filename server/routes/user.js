var express = require('express');
var router = express.Router();
var passport = require('passport');
var path = require('path');
var Chance = require('chance');
var chance = new Chance();
var fs = require('fs');
var Users = require('../models/user');

if(process.env.BASE_URL != undefined) {
  var baseURL = BASE_URL;
} else {
  var jsonPath = path.join(__dirname, '..', 'conf', 'settings.json');
  var rawdata = fs.readFileSync(jsonPath);
  var configValues = JSON.parse(rawdata);
  var baseURL = configValues.take12app.BASE_URL;
}

// Handles Ajax request for user information if user is authenticated
router.get('/', function(req, res) {
  // check if logged in
  if(req.isAuthenticated()) {
    // send back user object from database
    //prepare an object = { }
    res.send(req.user);
  } else {
    // failure best handled on the server. do redirect here.
    console.log('not logged in');
    // should probably be res.sendStatus(403) and handled client-side, esp if this is an AJAX request (which is likely with AngularJS)
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
      res.sendStatus(500);
    }
    var emailMessage = 'Reset your password here: ' + baseUrl + '/#/confirmreset/' + code;

    // TODO: mail out that link with sendgrid.


    foundUser.code = code;
    var expireCode = moment().add(1, 'days').format();
    foundUser.expiration = expireCode;
    foundUser.save(function(err, savedUser) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
    });
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
      }
    });
  });
});


module.exports = router;

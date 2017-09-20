var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var Users = require('../models/user');
var path = require('path');
var fs = require('fs');


// Require stripe
if(process.env.STRIPE_SECRET != undefined) {
  var stripe = require('stripe')(STRIPE_SECRET);
} else {
  var jsonPath = path.join(__dirname, '..', 'conf', 'settings.json');
  var rawdata = fs.readFileSync(jsonPath);
  var configValues = JSON.parse(rawdata);

  var stripe = require('stripe')(configValues.stripe.STRIPE_SECRET);
}

//User initiates stripe account
router.post('/newaccount', function(req, res) {
  console.log('req.body', req.body);
  var email = req.body.email;

  if(req.body.email !== undefined) {
    stripe.accounts.create({
      type: 'standard',
      country: 'US',
      email: email
    }, function(err, account) {
      // asynchronously called
      if (err) {
        console.log('error connecting to Stripe', err);
        res.send('error connecting to Stripe');
      } else {
        console.log('Stripe account created: ', JSON.stringify(account));
        // Updates user's information with Stripe account
        Users.findOneAndUpdate(
          {email: email},
          {$set: {stripe_user_id: account.id, stripe_keys: account.keys}},
          {safe: true},
          function(err, model) {
            if (err) {
              console.log('Error updating user Information with Stripe data',err);
              res.send('Error updating user Information with Stripe data');
            }
            else {
              console.log('User account updated successfully with Stripe information', model);
              res.send('User account updated successfully with Stripe information');
            }
          }
        );
      }
    });
  } else {
    //what to do if else?
    console.log('Email not defined');
  }

});


module.exports = router;

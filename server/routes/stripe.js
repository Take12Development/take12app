var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var Users = require('../models/user');
var Registry = require('../models/registryModel');
var Donor = require('../models/donors');
var path = require('path');
var fs = require('fs');
var UnclaimedRegistry = require('../models/unclaimedRegistryModel');

// Require stripe
if(process.env.STRIPE_SECRET != undefined) {
  var stripe = require('stripe')(process.env.STRIPE_SECRET);
  var CONNECTED_ACCOUNT_SECRET_KEY = process.env.STRIPE_SECRET;
} else {
  var jsonPath = path.join(__dirname, '..', 'conf', 'settings.json');
  var rawdata = fs.readFileSync(jsonPath);
  var configValues = JSON.parse(rawdata);

  var stripe = require('stripe')(configValues.stripe.STRIPE_SECRET);
  var CONNECTED_ACCOUNT_SECRET_KEY = configValues.stripe.STRIPE_SECRET;
}

//User initiates stripe account
router.post('/newaccount', function(req, res) {
  console.log('STRIPE RECEIVED INFO req.body', req.body);
  var email = req.body.email;

  if(req.body.email !== undefined) {
    stripe.accounts.create({
      type: 'standard',
      country: 'US',
      email: email,
      business_url: 'https://www.mytake12.com',
      business_name: 'Take12',
      product_description: 'Time/MoneyGiftRegistry',
      statement_descriptor: 'Take12 Registry'
    },{ api_key: CONNECTED_ACCOUNT_SECRET_KEY }, function(err, account) {
      // asynchronously called
      if (err) {
        console.log('error connecting to Stripe', err);
        res.send('error connecting to Stripe');
      } else {
        console.log('Stripe account created: ', JSON.stringify(account));
        // Updates user's information with Stripe account

        Users.findOneAndUpdate(
          {email: email},
          {$set: {stripe_user_id: account.id, stripe_keys: account.keys,
                  stripeConnected: true, stripeAccountActivated: false}},
          {safe: true},
          function(err, updatedUser) {
            if (err) {
              console.log('Error updating user Information with Stripe data',err);
              res.send('Error updating user Information with Stripe data');
            }
            else if(!updatedUser) {
              // user not found, save credentials into unclaimed registry
              UnclaimedRegistry.findOneAndUpdate(
                {email: email},
                {$set: {stripe_user_id: account.id, stripe_keys: account.keys,
                        stripeConnected: true, stripeAccountActivated: false}},
                {safe: true},
                function(err, updatedUnclaimedAccount){
                  if (err) {
                    console.log('Error updating user Information with Stripe data',err);
                    res.send('Error updating user Information with Stripe data');
                  } else {
                    console.log('Unclaimed registry account updated successfully with Stripe information', updatedUnclaimedAccount);
                    res.send('Unclaimed registry account updated successfully with Stripe information');
                  }
                }
              );
            } else {
              console.log('User account updated successfully with Stripe information', updatedUser);
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

//Stripe Webhooks (account activated)
router.post("/webhook/accountactivated", function(request, response) {
  // Retrieve the request's body
  var stripeData = request.body;

  if(stripeData) {
    var userId = stripeData.data.object.id;
    Users.findOneAndUpdate({stripe_user_id: userId},
      {$set: {stripeAccountActivated : true}}, {new: true}, function(err, updatedUser) {
        if(err){
          console.log(err);
        } else {
          console.log('user claimed their account', updatedUser);
        }
      });
  }

  response.sendStatus(200);
});

// Charges amount via Stripe and updates registry information
router.post("/charge", function(req, res) {
    var chargeData = req.body;
    console.log('CHARGE DATA RECEIVED', JSON.stringify(chargeData));

    var stripeToken = req.body.stripeToken;
    var total = req.body.amount;
    var checkoutTotal = parseInt(total);
    var stripeTotalCoversion = checkoutTotal * 100;
    var id = req.body.registryAccount;
    var registryEmail = req.body.registryEmail;
    var cardholderName = req.body.cardholderName;
    var customerEmail = req.body.emailForReceipt;
    var registryAccount = id.toString();
    var registryComment = req.body.registryComment;
    var take12fee = (checkoutTotal * 100) * .03;

    // get Stripe Information from Users account
    Users.findOne({email: registryEmail}, function(err, foundUser) {
      if (err) {
          console.log('Mongo error: ', err);
          return (err);
      } else {
          var stripeAccount = foundUser.stripe_user_id;
          // console.log('FOUNDUSER', JSON.stringify(foundUser));
          console.log('STRIPE account:', foundUser.stripe_user_id);

          stripe.charges.create({
                amount: stripeTotalCoversion,
                currency: 'USD',
                source: stripeToken,
                description: "Take 12 Time Registry",
                receipt_email: customerEmail,
                application_fee: take12fee // amount in cents
            },
            //accout funds are being sent to
            {
                stripe_account: stripeAccount
            },
            function(err, charge) {
                if (err) {
                    switch (err.type) {
                        case 'StripeCardError':
                            // A declined card error
                            err.message; // => e.g. "Your card's expiration year is invalid."
                            res.redirect('/#/transactionError/' + err.message);
                            // res.status(400).send(err.message);
                            break;
                        case 'RateLimitError':
                            // Too many requests made to the API too quickly
                            res.redirect('/#/transactionError/' + 'Rate Limit Error');
                            // res.status(400).send('RateLimitError');
                            break;
                        case 'StripeInvalidRequestError':
                            // Invalid parameters were supplied to Stripe's API
                            res.redirect('/#/transactionError/' + 'Stripe Invalid Request Error');
                            // res.status(400).send('StripeInvalidRequestError');
                            break;
                        case 'StripeAPIError':
                            // An error occurred internally with Stripe's API
                            res.redirect('/#/transactionError/' + 'Stripe API Error');
                            // res.status(400).send('StripeAPIError');
                            break;
                        case 'StripeConnectionError':
                            // Some kind of error occurred during the HTTPS communication
                            res.redirect('/#/transactionError/' + 'Stripe Connection Error');
                            // res.status(400).send('StripeConnectionError');
                            break;
                        case 'StripeAuthenticationError':
                            // You probably used an incorrect API key
                            res.redirect('/#/transactionError/' + 'Stripe Authentication Error');
                            // res.status(400).send('StripeAuthenticationError');
                            break;
                        default:
                            // Handle any other types of unexpected errors
                            res.redirect('/#/transactionError/' + err);
                            console.log(err);
                            break;
                    }
                } else {
                    Registry.findById(id, function(err, foundRegistry) {
                        if (err) {
                            // Mongo error finding registry
                            return (err);
                        } else {
                            //TAKE 12 USER REGISTRY INFO
                            var currentRegistryTotal = foundRegistry.currentAmount;
                            var currentAmount = parseInt(currentRegistryTotal);
                            var RegistryCurrentAmount = checkoutTotal + currentAmount;
                            //GIFTER INFORMATION
                            var nameInput = cardholderName;
                            var fullName = nameInput.toLowerCase();
                            var firstName = fullName.split(' ').slice(0, -1).join(' ');
                            var lastName = fullName.split(' ').slice(-1).join(' ');
                            var donorFirstName = firstName;
                            var donorLastName = lastName
                            var zipcode = charge.source['address_zip'];
                            var date = new Date();
                            var lastGiftDate = date.toDateString();
                            var totalGifted = 0;
                            var currentTotal = totalGifted + checkoutTotal;
                            var commentName = req.body.gifterName;
                            // defaults to name in card if donor didn't enter a name in form
                            if (commentName.length > 0) {
                                donorName = commentName;
                            } else {
                                donorName = nameInput;
                            }
                            //Comments & total gifts
                            if (registryComment == "") {
                                var updateObj = {
                                    currentAmount: RegistryCurrentAmount
                                };
                            } else {
                                var updateObj = {
                                    currentAmount: RegistryCurrentAmount,
                                    $push: {
                                        comments: {
                                            "donorName": donorName,
                                            "comment": registryComment
                                        }
                                    }
                                };
                            } // else Comments & total gifts
                            // Update Donor table
                            Donor.findOneAndUpdate({
                                email: customerEmail
                            }, {
                                $set: {
                                    lastGiftDate: new Date()
                                },
                                $inc: {
                                    numberOfGifts: 1,
                                    totalGifted: checkoutTotal
                                }
                            }, {
                                new: true
                            }, function(error, result) {
                                if (!error) {
                                    // If the document doesn't exist
                                    if (!result) {
                                        // Create it
                                        var donor = new Donor({
                                            firstName: donorFirstName,
                                            lastName: donorLastName,
                                            email: customerEmail,
                                            lastGiftDate: lastGiftDate,
                                            numberOfGifts: 1,
                                            totalGifted: checkoutTotal
                                        });

                                        // Save the document
                                        donor.save(function(error) {
                                            if (!error) {
                                                // console.log('Saved, check you DB');
                                            } else {
                                                throw error;
                                            }
                                        });
                                    }
                                }
                            });

                            // Update Registry
                            Registry.findByIdAndUpdate(id, updateObj, {
                                new: true
                            }, function(err, updateRegistry) {
                                if (err) {
                                    res.redirect('/#/transactionError/' + "Didn't update registry after payment");
                                    // res.sendStatus(500);
                                } else {
                                    res.redirect('/#/thankyou');
                                } // else if (err)
                            }); // Registry.findByIdAndUpdate
                        } // else
                    }); // Registry.findById
                } // else if (err)
            } //function(err, charge)
        ) //stripe.charges.create
      } // else if (err)
  }); // Users.findOne
}); // router.post("/charge"

module.exports = router;

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var path = require('path');
var fs = require('fs');
var Registry = require('../models/registryModel');
var UnclaimedRegistry = require('../models/unclaimedRegistryModel');
var Users = require('../models/user');
var Promise = require('promise');
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

// Send email functions:
function sendEmail(emailInfo) {
  var textEmailMessage = '';
  var subjectMessage = '';
  if (emailInfo.user == 'new') {
    textEmailMessage = 'A new registry has been created for you, ' +
                           'please create an account using ' +
                           'your email address to claim your registry. ' +
                           baseURL + '/#/register';
    subjectMessage = 'A Take12 Registry has been created for you';
  } else if (emailInfo.user == 'existing') {
    textEmailMessage = 'A new registry has been created for you, ' +
                           'please login to your account ' +
                           'to see your registry. ' +
                           baseURL + '/#/home';
    subjectMessage = 'A Take12 Registry has been created for you';
  } else {
    textEmailMessage = 'Welcome to take12. ' +
                           'Please login to your account ' +
                           'to see your registry. ' +
                           baseURL + '/#/home';
    subjectMessage = 'Welcome to Take12!';
  }
  // Mail out message with sendgrid.
  var msg = {
    to: emailInfo.email,
    from: 'Take12 <admin@mytake12.com>',
    subject: subjectMessage,
    text: textEmailMessage,
    html: textEmailMessage
  };
  sgMail.send(msg, function(err, result) {
    if (err) {
      console.log('Error (sendgrid)',err);
      // res.send('Error sending email');
    } else {
      // message sent
      console.log('Email sent successfully. Email address was', emailInfo.email);
      console.log('Email sent successfully. Email option was', emailInfo.user);
    }
  });
}

// gets all registries from the database
router.get('/all', function(req,res){
  Registry.find({},function(err,allRegistries) {
    if(err) {
      console.log('Mongo error: ',err);
    }
    res.send(allRegistries);
  }).sort( { dueDate: -1 } );
});

// gets a specific registry from the database
router.get('/:registryURL', function(req,res){
  var searchURL = req.params.registryURL;
  Registry.findOne({'registryURL': searchURL},function(err, foundRegistry) {
    if(err) {
      console.log('Mongo error: ',err);
    }
    res.send(foundRegistry);
  });
});

// gets array of unclaimed registries for a specific user
router.get('/unclaimed/:email', function(req,res){
  if(req.isAuthenticated()) {
    var searchEmail = req.params.email;
    UnclaimedRegistry.findOne({'email': searchEmail},function(err, foundUnclaimedRegistry) {
      if(err) {
        console.log('Mongo error: ',err);
      }
      res.send(foundUnclaimedRegistry);
    });
  } else {
    res.sendStatus(401);
  }
});


// gets all registries that are part of array received as a parameter
router.post('/getuserregistries', function(req,res) {
  if(req.isAuthenticated()) {
    var arrayOfRegistries = req.body.registries;
    Registry.find({ registryURL: { $in: arrayOfRegistries } } ,function(err, foundRegistries) {
      if(err) {
        console.log('Mongo error: ',err);
      }
      res.send(foundRegistries);
    });
  } else {
    res.sendStatus(401);
  }
});

// creates newURL based on first and last name
function createURL(firstName, lastName) {
  var newURL;
  var firstName = firstName.replace(/\s+/g, '');
  var lastName = lastName.replace(/\s+/g, '');
  var name = firstName + lastName;

  return new Promise(function(resolve,reject) {
      Registry.count({firstName: firstName, lastName: lastName}, function(err, count){
        if(err) {
          console.log('Mongo error: ',err);
          reject(err);
        } else {
          if(count === 0) {
            newURL = name;
          } else {
            var num = count + 1;
            newURL = name + num;
          }
          resolve(newURL);
        }
      });
  });
}

// creates newURL based on first and last name
function updateFBUser(facebookId, email) {
  console.log('Updating user email:', email);
  return new Promise(function(resolve,reject) {
    Users.findOneAndUpdate(
      {'facebookId': facebookId},
      {'email': email},
      function(err, user) {
        if(err) {
          console.log(err);
          reject(err);
        } else {
          resolve(user);
        }
      }
    );
  });
}

// saves a registry into the database
router.post('/addselfregistry', function(req,res) {
  if(req.isAuthenticated()) {
    // for facebook new users we insert email to user in users table
    if (req.body.facebookId) {
      updateFBUser(req.body.facebookId,req.body.email);
    };

    var first = req.body.firstName.toLowerCase();
    var last = req.body.lastName.toLowerCase();
    var email = req.body.email.toLowerCase();
    var organizerEmail = req.body.organizerEmail.toLowerCase();

    createURL(first, last).then(function(data) {
      var createdRegistryURL = data;
      var registry = new Registry();
      registry.registryURL = createdRegistryURL;
      registry.firstName = first;
      registry.lastName = last;
      registry.goalAmount = req.body.goalAmount;
      registry.currentAmount = 0;
      registry.paidWeeks = req.body.paidWeeks;
      registry.goalAmtEntryOpt = req.body.goalAmtEntryOpt;
      registry.netIncome = req.body.netIncome;
      registry.paidWeeksPercentage = req.body.paidWeeksPercentage;
      registry.createDate = req.body.createDate;
      registry.dueDate = req.body.dueDate;
      registry.city = req.body.city;
      registry.state = req.body.state;
      registry.imageURL = req.body.imageURL;
      registry.story = req.body.story;
      registry.privacy = req.body.privacy;
      registry.email = email;
      registry.organizerEmail = organizerEmail;
      registry.save(function(err, savedRegistry){
        if(err){
          console.log("Mongo error:", err);
          res.sendStatus(500);
        } else {
          // saves registryURL into user table
          Users.findOneAndUpdate(
              {'email': email},
              {$push: {'registries': createdRegistryURL}},
              {safe: true},
              function(err, foundUser) {
                if (err) {
                  console.log('Error updating user Information with registries data',err);
                } else {
                  console.log('User account updated successfully');
                  var emailInfo = {name: req.body.firstName, email: email, user: 'welcome'};
                  sendEmail(emailInfo);
                }
              }
          );
          res.send(savedRegistry);
        }
      });
    });
  } else {
    res.sendStatus(401);
  }
});

// saves a registry for a lovedone into the database
router.post('/addlovedoneregistry', function(req,res) {
  if(req.isAuthenticated()) {
    // indicates which type of mail should be sent
    var newUser = false;
    // for facebook new users we insert email to user in users table
    if (req.body.facebookId) {
      updateFBUser(req.body.facebookId,req.body.email);
    };
    var first = req.body.firstName.toLowerCase();
    var last = req.body.lastName.toLowerCase();
    var email = req.body.email.toLowerCase();
    var organizerEmail = req.body.organizerEmail.toLowerCase();

    createURL(first, last).then(function(data) {
      console.log('Data',data);
      var createdRegistryURL = data;
      var registry = new Registry();
      registry.registryURL = createdRegistryURL;
      registry.firstName = first;
      registry.lastName = last;
      registry.goalAmount = req.body.goalAmount;
      registry.currentAmount = 0;
      registry.paidWeeks = req.body.paidWeeks;
      registry.goalAmtEntryOpt = req.body.goalAmtEntryOpt;
      registry.netIncome = req.body.netIncome;
      registry.paidWeeksPercentage = req.body.paidWeeksPercentage;
      registry.createDate = req.body.createDate;
      registry.dueDate = req.body.dueDate;
      registry.city = req.body.city;
      registry.state = req.body.state;
      registry.imageURL = req.body.imageURL;
      registry.story = req.body.story;
      registry.privacy = req.body.privacy;
      registry.email = email;
      registry.organizerEmail = organizerEmail;
      registry.save(function(err, savedRegistry){
        if(err){
          console.log("Mongo error:", err);
          res.sendStatus(500);
        } else {
          // saves registryURL into user table
          Users.findOneAndUpdate(
              {'email': email},
              {$push: {'registries': createdRegistryURL}},
              {safe: true},
              function(err, foundUser) {
                console.log('FOUNDUSER IS' , JSON.stringify(foundUser));
                if (err) {
                  console.log('Error updating user Information with registries data',err);
                }
                else if (!foundUser) {
                  // loved one doesn't have an account
                  // saves registry url into UnclaimedRegistry table
                  UnclaimedRegistry.findOneAndUpdate(
                    {'email': email},
                    {$push: {'registries': createdRegistryURL}},
                    {upsert:true},
                    function(err, savedUnclaimedRegistry) {
                      if (err) {
                        console.log("Mongo error:", err);
                      } else {
                        console.log('Unclaimed Registry saved successfully');
                        // call function that sends email to user
                        var emailInfo = {name: req.body.firstName, email: email, user: 'new'};
                        sendEmail(emailInfo);
                      }
                    }
                  );
                } else {
                  // lovedOne has an account
                  console.log('User account updated successfully');
                  // call function that sends email to user
                  var emailInfo = {name: req.body.firstName, email: email, user: 'existing'};
                  sendEmail(emailInfo);
                }
              }
            ); // Users.findOneAndUpdate
            // saves registryURL for organizer user
            Users.findOneAndUpdate(
              {'email': organizerEmail},
              {$push: {'registries': createdRegistryURL}},
              {safe: true},
              function(err, model) {
                if (err) {
                  console.log(err);
                } else {
                  console.log('Organizer Email updated successfully', model);
                }
              }
            );
            res.send(savedRegistry);
          } // else
      }); // registry.save
    }); // createURL(first, last).then
  } else {
    res.sendStatus(401);
  }
});

// updates registry information
router.put("/update", function(req,res){
  if(req.isAuthenticated()) {
    var registry = req.body;
    var first = req.body.firstName.toLowerCase();
    var last = req.body.lastName.toLowerCase();
    Registry.findById(registry._id, function(err, foundRegistry){
      if(err){
        console.log(err);
        res.sendStatus(500);
      }
      foundRegistry.firstName = first;
      foundRegistry.lastName = last;
      foundRegistry.dueDate = req.body.dueDate;
      foundRegistry.goalAmount = req.body.goalAmount;
      foundRegistry.imageURL = req.body.imageURL;
      foundRegistry.story = req.body.story;
      foundRegistry.privacy = req.body.privacy;
      foundRegistry.city = req.body.city;
      foundRegistry.state = req.body.state;
      foundRegistry.country = req.body.country;
      foundRegistry.save(function(err, savedRegistry){
        if(err){
          console.log(err);
          res.sendStatus(500);
        } else {
          res.send(savedRegistry);
        }
      });
    });
  } else {
    res.sendStatus(401);
  }
});

// claims register
router.put("/claim", function(req,res){
  if(req.isAuthenticated()) {
    console.log('CLAIMING ACCOUNT');
    var email = req.body.email;
    var registryUrl = req.body.registryURL;
    var stripeAccountActivated;
    var stripeConnected;
    var stripe_keys;
    var stripe_user_id;
    console.log('EMAIL IS', email);
    console.log('REGISTRYURL IS',registryUrl);
    // get information from UnclaimedRegistry table
    UnclaimedRegistry.findOneAndRemove(
      {'email': email},
      function(err, foundUnclaimed) {
        if (err) {
          console.log('Finding user in UnclaimedRegistry error: ',err);
        } else {
          console.log('Finding user in UnclaimedRegistry: ', JSON.stringify(foundUnclaimed));
          // Copy data to user table
          Users.findOne({'email': email}, function(err, foundUser){
            if(err){
              console.log('Error finding user in claim',err);
            }
            if (foundUser) {
              foundUser.stripeAccountActivated = foundUnclaimed.stripeAccountActivated;
              foundUser.stripeConnected = foundUnclaimed.stripeAccountActivated;
              foundUser.stripe_keys = foundUnclaimed.stripe_keys;
              foundUser.stripe_user_id = foundUnclaimed.stripe_user_id;
              foundUser.registries.push(registryUrl);

              foundUser.save(function(err, savedUser){
                if(err){
                  console.log('Error updating users table in claim', err);
                } else {
                  console.log('CLAIM: Updated user',savedUser);
                  res.send(savedUser);
                }
              });
            } else {
              res.send('There was a problem claiming the registry');
            }
        });
      }
    });
  } else {
    res.sendStatus(401);
  }
});


module.exports = router;

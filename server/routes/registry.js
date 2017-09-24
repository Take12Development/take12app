var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Registry = require('../models/registryModel');
var UnclaimedRegistry = require('../models/unclaimedRegistryModel');
var Users = require('../models/user');
var Promise = require('promise');

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
  Registry.findOne({registryURL: searchURL},function(err, foundRegistry) {
    if(err) {
      console.log('Mongo error: ',err);
    }
    res.send(foundRegistry);
  });
});

// gets array of unclaimed registries for a specific user
router.get('/unclaimed/:email', function(req,res){
  var searchEmail = req.params.email;
  UnclaimedRegistry.findOne({email: searchEmail},function(err, foundUnclaimedRegistry) {
    if(err) {
      console.log('Mongo error: ',err);
    }
    res.send(foundUnclaimedRegistry);
  });
});


// gets all registries that are part of array received as a parameter
router.post('/getuserregistries', function(req,res) {
  var arrayOfRegistries = req.body.registries;
  Registry.find({ registryURL: { $in: arrayOfRegistries } } ,function(err, foundRegistries) {
    if(err) {
      console.log('Mongo error: ',err);
    }
    res.send(foundRegistries);
  });
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
      {facebookId: facebookId},
      {email: email},
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
router.post('/add', function(req,res) {

  // for facebook new users we insert email to user in users table
  if (req.body.facebookId) {
    updateFBUser(req.body.facebookId,req.body.email);
  };

  var first = req.body.firstName.toLowerCase();
  var last = req.body.lastName.toLowerCase();
  var email = req.body.email.toLowerCase();
  var organizerEmail = req.body.organizerEmail.toLowerCase();
  console.log('organizerEmail', organizerEmail)

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
          {email: email},
          {$push: {registries: createdRegistryURL}},
          {safe: true},
          function(err, foundUser) {
            if (err) {
              console.log('Error updating user Information with registries data',err);
            }
            else if (!foundUser) {
              // user doesn't have an account (registry created for a loved one)
              // saves registry url into UnclaimedRegistry table
              UnclaimedRegistry.findOneAndUpdate(
                {email: email},
                {$push: {registries: createdRegistryURL}},
                {upsert:true},
                function(err, savedUnclaimedRegistry) {
                  if (err) {
                    console.log("Mongo error:", err);
                  }
                }
              );
            } else {
              console.log('User account updated successfully', foundUser);
            }
          }
      );
      // saves registryURL for organizer user
      if (organizerEmail != '' && organizerEmail != null) {
        Users.findOneAndUpdate(
            {email: organizerEmail},
            {$push: {registries: createdRegistryURL}},
            {safe: true},
            function(err, model) {
                console.log(err);
            }
        );
      }
      res.send(savedRegistry);
    }
    });
  });
});

// updates registry information
router.put("/update", function(req,res){
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
});

// claims register
router.put("/claim", function(req,res){
  var email = req.body.email;
  var registryUrl = req.body.registryURL;

  // Updates users' table
  Users.findOneAndUpdate(
      {email: email},
      {$push: {registries: registryUrl}},
      {safe: true},
      function(err, updatedUser) {
        if (err) {
          console.log(err);
        } else {
          // delete from UnclaimedRegistry
          UnclaimedRegistry.findOneAndUpdate(
            {email: email},
            {$pull: {registries: registryUrl}},
            function(err, updatedUnclaimedRegistry) {
              if (err) {
                console.log("Mongo error:", err);
              } else {
                res.send(updatedUser);
              }
            }
          );
        }
      }
  );
});


module.exports = router;

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Registry = require('../models/registryModel');
var Users = require('../models/user');
var Promise = require('promise');

// gets all registries from the database
router.get('/all', function(req,res){
  console.log("/registry/all get route hit");
  Registry.find({},function(err,allRegistries) {
    if(err) {
      console.log('Mongo error: ',err);
    }
    res.send(allRegistries);
  }).sort( { dueDate: -1 } );
});

// creates newURL based on first and last name
function createURL(firstName, lastName) {
  var newURL;
  var firstName = firstName.replace(/\s+/g, '');
  var lastName = lastName.replace(/\s+/g, '');
  var name = firstName + lastName;
  console.log('name is:',name);

  return new Promise(function(resolve,reject) {
      Registry.count({firstName: firstName, lastName: lastName}, function(err, count){
        if(err) {
          console.log('Mongo error: ',err);
          reject(err);
        } else {
          console.log('Number of registries with same name', count);
          if(count === 0) {
            newURL = name + "registry";
          } else {
            var num = count + 1;
            newURL = name + num + "registry";
          }
          console.log('newURL:',newURL);
          resolve(newURL);
        }
      });
  });
};

// saves a registry into the database
router.post('/add', function(req,res) {
  console.log("/add post route hit");

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
    registry.dueDate = req.body.dueDate;
    registry.imageURL = req.body.imageURL;
    registry.story = req.body.story;
    registry.privacy = req.body.privacy;
    registry.email = email;
    registry.organizerEmail = organizerEmail;
    registry.stripeConnected = false;
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
          function(err, model) {
              console.log(err);
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
  Registry.findById(registry._id, function(err, foundRegistry){
    if(err){
      console.log(err);
      res.sendStatus(500);
    }
    foundRegistry.firstName = req.body.firstName;
    foundRegistry.lastName = req.body.lastName;
    foundRegistry.goalAmount = req.body.goalAmount;
    foundRegistry.dueDate = req.body.dueDate;
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

module.exports = router;

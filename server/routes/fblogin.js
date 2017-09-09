var router = require('express').Router();
var path = require('path');
var passport = require('passport');
var User = require('../models/user.js');

router.post('/auth/facebook/token',
  passport.authenticate('facebook-token'), function (req, res) {

    // console.log('Request.user on login', req.user['newAccount']);
    console.log('Request.user on login', req);

    // CC do something with req.user
    res.sendStatus(req.user? 200 : 401);


        // if(req.user['newAccount'] === false) {
        //   // console.log('Request.user on login', req.user);
        //   res.send(req.user);
        // } else {


          // do something with req.user
          // console.log('req.body', req.body);
          // console.log('req.params', req.params);
          // console.log('req.query', req.query);
          // console.log('req.user', req.user);


          // var id = req.user;
          // var updateObject = {
          // firstName: req.body.firstName,
          // lastName: req.body.lastName,
          // facebookid: req.body.facebookid,
          // email: req.body.email,
          // amount: 0,
          // currentAmount: 0,
          // description1: "",
          // description2: "",
          // startDate: req.body.startDate,
          // endDate: req.body.endDate,
          // private: false,
          // newAccount: true,
          // stripeConnected: false,
          // };

        // User.findByIdAndUpdate(id, updateObject, {new: true}, function(err, user) {
        //   if(err) {
        //     console.log('Log There was an error updating database', err);
        //     res.sendStatus(500);
        //   } else {
        //     // console.log('User after auth', user);
        //     res.send(user);
        //   }
        // })
    });
  // });




module.exports = router;

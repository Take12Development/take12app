var router = require('express').Router();
var path = require('path');
var passport = require('passport');
var User = require('../models/user.js');

router.post('/auth/facebook/token',
  passport.authenticate('facebook-token'), function (req, res) {
    res.send(req.user);
  }
);

module.exports = router;

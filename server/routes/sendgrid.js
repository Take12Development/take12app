var router = require('express').Router();
var path = require('path');
var passport = require('passport');
var User = require('../models/user.js');

// using SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
var sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

var msg = {
  to: 'test@example.com',
  from: 'test@example.com',
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};
sgMail.send(msg);

module.exports = router;

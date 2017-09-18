var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var Users = require('../models/user');
var path = require('path');
var fs = require('fs');

const sgMail = require('@sendgrid/mail');

if(process.env.SENDGRID_API_KEY != undefined) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  var jsonPath = path.join(__dirname, '..', 'conf', 'settings.json');
  var rawdata = fs.readFileSync(jsonPath);
  var configValues = JSON.parse(rawdata);

  sgMail.setApiKey(configValues.sendgrid.SENDGRID_API_KEY);
}

function GetFormattedDate() {
    var todayTime = new Date();
    var month = todayTime .getMonth() + 1;
    var day = todayTime .getDate();
    var year = todayTime .getFullYear();
    return month + "/" + day + "/" + year;
}

router.post('/testmail', function(req, res){

  const msg = {
    to: 'claudia.calderas@gmail.com',
    from: 'Take12 <admin@mytake12.com>',
    subject: 'Sending with SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: "<strong>and easy 'Some One <someone@example.org>', to do anywhere, even with Node.js</strong>"
  };
  sgMail.send(msg, function(err, result) {
    if (err) {
      console.log('err');
      res.send('error sending email');
    } else {
      console.log('message sent: ' + result);
      res.send(result);
    }
  });

});



module.exports = router;

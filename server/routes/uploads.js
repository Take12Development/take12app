var express = require('express');
var router = express.Router();
var cloudinary = require('cloudinary');
var fs = require('fs');
var path = require('path');
var Upload = require('../models/upload');
var multer = require('multer');

// Cloudinary Config takes json config file if config vars are not available
if(process.env.CLOUDNAME != undefined &&
  process.env.CLOUDAPIKEY != undefined &&
  process.env.CLOUDAPISECRET != undefined) {
    // config cloudinary
    cloudinary.config({
        cloud_name: process.env.CLOUDNAME,
        api_key: process.env.CLOUDAPIKEY,
        api_secret: process.env.CLOUDAPISECRET
    });
} else {
  var jsonPath = path.join(__dirname, '..', 'conf', 'settings.json');
  var rawdata = fs.readFileSync(jsonPath);
  var configValues = JSON.parse(rawdata);
  cloudinary.config({
      cloud_name: configValues.cloudinary.cloud_name,
      api_key: configValues.cloudinary.api_key,
      api_secret: configValues.cloudinary.api_secret
  });
}

var storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + '.jpg');
  }
});

var upload = multer({ storage: storage });

// Uploads file into Cloudinary
router.post('/', upload.single('file'), function(req, res){
  if(req.isAuthenticated()) {
    cloudinary.uploader.upload(req.file.path, function(error, result) {
      if (error) {
        res.send(error);
      } else {
        var imagePath = result.secure_url;
        res.send(imagePath);
      }
    })
  } else {
    res.sendStatus(401);
  }
});

module.exports = router;

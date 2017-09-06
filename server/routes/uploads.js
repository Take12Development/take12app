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

router.post('/', upload.single('file'), function(req, res){
  console.log('looking for file', req.file);
  cloudinary.uploader.upload(req.file.path, function(error, result) {
    if (error) {
      res.send(error);
    } else {
      console.log('cloudinary inside function', result.secure_url);
      var imagePath = result.secure_url;
      res.send(imagePath);
    }
  })
});



// PREVIOUS VERSION - UPLOAD LOCALLY
// Creates the file in the database
// router.post('/', upload.single('file'), function (req, res, next) {
//   console.log(req.body);
//   console.log(req.file);
//   var newUpload = {
//     created: Date.now(),
//     file: req.file
//   };
//   Upload.create(newUpload, function (err, next) {
//     if (err) {
//       next(err);
//     } else {
//       res.send(newUpload);
//     }
//   });
// });
//
// // Gets the list of all files from the database
// router.get('/', function (req, res, next) {
//   Upload.find({},  function (err, uploads) {
//     if (err) next(err);
//     else {
//       res.send(uploads);
//     }
//   });
// });
//
// // Gets a file from the hard drive based on the unique ID and the filename
// router.get('/:uuid/:filename', function (req, res, next) {
//   console.log(req.params);
//   Upload.findOne({
//     'file.filename': req.params.uuid,
//     'file.originalname': req.params.filename
//   }, function (err, upload) {
//     if (err) next(err);
//     else {
//       res.set({
//         "Content-Disposition": 'attachment; filename="' + upload.file.originalname + '"',
//         "Content-Type": upload.file.mimetype
//       });
//       fs.createReadStream(upload.file.path).pipe(res);
//     }
//   });
// });


module.exports = router;

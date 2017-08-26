var mongoose = require('mongoose');

// Picture upload Schema
var UploadSchema = mongoose.Schema({
  created: Date,
  file: Object
});

module.exports = mongoose.model('Upload', UploadSchema);

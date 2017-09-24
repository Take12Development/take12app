var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var DonorSchema = new Schema({
  firstName: String,
  lastName: String,
  email: {type: String, lowercase: true},
  lastGiftDate: Date,
  numberOfGifts: Number,
  totalGifted: Number,
  zip: Number
});

var Donor = mongoose.model('Donor', DonorSchema);

module.exports = Donor;

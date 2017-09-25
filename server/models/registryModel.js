var mongoose = require('mongoose');

// Registry Schema
var RegistrySchema = mongoose.Schema({
  registryURL: {type: String, required: true, index: {unique: true}},
  firstName: String,
  lastName: String,
  goalAmount: Number,
  currentAmount: Number,
  startDate: Date,
  createDate: Date,
  dueDate: Date,
  imageURL: String,
  story: String,
  privacy: String,
  email: String,
  city: String,
  state: String,
  country: String,
  organizerEmail: String,
  paidWeeks: Number,
  goalAmtEntryOpt: Number,
  netIncome: Number,
  paidWeeksPercentage: Number,
  comments: [],
  facebookId: String,
});

module.exports = mongoose.model('registry', RegistrySchema, 'registries');

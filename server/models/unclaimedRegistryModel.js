var mongoose = require('mongoose');

// Unclaimed Registry Schema
var UnclaimedRegistrySchema = mongoose.Schema({
  email: {type: String, unique: true},
  registries : [],
  stripe_user_id: String,
  stripe_keys: {},
  stripeConnected: Boolean,
  stripeAccountActivated: Boolean
});

module.exports = mongoose.model('unclaimedRegistry', UnclaimedRegistrySchema, 'unclaimedRegistries');

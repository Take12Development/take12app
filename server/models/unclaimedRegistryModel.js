var mongoose = require('mongoose');

// Unclaimed Registry Schema
var UnclaimedRegistrySchema = mongoose.Schema({
  email: {type: String, unique: true},
  registries : []
});

module.exports = mongoose.model('unclaimedRegistry', UnclaimedRegistrySchema, 'unclaimedRegistries');

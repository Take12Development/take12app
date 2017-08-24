var mongoose = require('mongoose');

// Registry Schema
var RegistrySchema = mongoose.Schema({
  registryURL: String,
  firstName: String,
  lastName: String,
  goalAmount: Number,
  dueDate: Date
});

module.exports = mongoose.model('registry', RegistrySchema, 'registries');

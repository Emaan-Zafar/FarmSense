var mongoose = require('mongoose');

var activityLevelSchema = new mongoose.Schema({
  cow: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  hour: {
    type: Number,
    required: true,
  },
  IN_ALLEYS: {
    type: Number,
    default: 0,
  },
  REST: {
    type: Number,
    default: 0,
  },
  EAT: {
    type: Number,
    default: 0,
  },
  ACTIVITY_LEVEL: {
    type: Number,
    default: 0.0,
  },
  oestrus: {
    type: Number,
    default: 0,
  },
  calving: {
    type: Number,
    default: 0,
  },
  lameness: {
    type: Number,
    default: 0,
  },
  mastitis: {
    type: Number,
    default: 0,
  },
  LPS: {
    type: String,
    default: 'NA',
  },
  acidosis: {
    type: String,
    default: 'NA',
  },
  other_disease: {
    type: Number,
    default: 0,
  },
  accidents: {
    type: Number,
    default: 0,
  },
  disturbance: {
    type: Number,
    default: 0,
  },
  mixing: {
    type: Number,
    default: 0,
  },
  management_changes: {
    type: Number,
    default: 0,
  },
  OK: {
    type: Number,
    default: 1,
  },
}, { collection: 'ActivityLevel' });

// Create and export the model
var activityModel = mongoose.model('ActivityLevel', activityLevelSchema);

module.exports = activityModel;

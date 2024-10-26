const mongoose = require('mongoose');

const cowHealthSchema = new mongoose.Schema({
  cow_id: {
    type: String,
    required: true,
  },
  body_temperature: {
    type: Number,
    required: true,
  },
  milk_production: {
    type: Number,
    required: true,
  },
  respiratory_rate: {
    type: Number,
    required: true,
  },
  walking_capacity: {
    type: Number,
    required: true,
  },
  sleeping_duration: {
    type: Number,
    required: true,
  },
  body_condition_score: {
    type: Number,
    required: true,
  },
  heart_rate: {
    type: Number,
    required: true,
  },
  eating_duration: {
    type: Number,
    required: true,
  },
  lying_down_duration: {
    type: Number,
    required: true,
  },
  ruminating: {
    type: Number,
    required: true,
  },
  rumen_fill: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

const CowHealth = mongoose.model('CowHealth', cowHealthSchema);

module.exports = CowHealth;

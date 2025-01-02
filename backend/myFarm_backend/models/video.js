const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  fileName: String,
  filePath: String,
  uploadedAt: { type: Date, default: Date.now },
}, { collection: 'Video' });

var videoModel = mongoose.model('Video', videoSchema);

module.exports = videoModel;

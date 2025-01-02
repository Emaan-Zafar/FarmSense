const multer = require('multer');
const express = require("express");
const path = require('path');
let router = express.Router();

const VideoModel = require('../../models/video');

const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'C:/Users/aamna/Downloads/uploads/videos');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
const uploadVideo = multer({ storage: videoStorage });

router.post('/', uploadVideo.single('video'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Video upload failed' });
    }
  
    try {
      const video = new VideoModel({
        fileName: req.file.filename,
        filePath: req.file.filename,
      });
      await video.save();
  
      res.status(201).json({ message: 'Video uploaded successfully', video });
    } catch (err) {
      res.status(500).json({ error: `Failed to save video: ${err.message}` });
    }
});

router.get('/videos', async (req, res) => {
    try {
      const videos = await VideoModel.find();
      res.status(200).json(videos);
    } catch (err) {
      res.status(500).json({ error: `Failed to fetch videos: ${err.message}` });
    }
});

module.exports = router;
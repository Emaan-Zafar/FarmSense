const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const express = require("express");
const path = require('path');
let router = express.Router();

const ActivityModel = require('../../models/activity_level');
const SymptomsModel = require('../../models/cow_health');
const { initializeHealthPredictions } = require('../../controllers/healthPredictionController'); 

const upload = multer({ dest: 'uploads/' });
const upload_video = multer({ dest: path.join(__dirname, '../backend/public/assets/video') });

router.post("/", upload.single('file'), (req, res) => {
  try {
    const { type } = req.body;
    const model = type === 'activity' ? ActivityModel : SymptomsModel;

    if (!model) {
      console.error('Invalid model type specified');
      return res.status(400).json({ error: 'Invalid type specified' });
    }

    const results = [];
    console.log('Starting file read...');

    fs.createReadStream(req.file.path)
      .pipe(csvParser())
      .on('data', (data) => {
        console.log('Processing row:', data); // Log each row for debugging

        // Reformat and convert date
        if (data.date) {
          const [day, month, year] = data.date.split('/');
          data.date = new Date(`${year}-${month}-${day}`); // Convert to Date object
          if (isNaN(data.date)) {
            console.error(`Invalid date format for row: ${data.date}`);
            return; // Skip this row if date is invalid
          }
        }
        results.push(data);
      })
      .on('end', async () => {
        console.log('File parsing completed, attempting to save to database...');
        try {
          await model.insertMany(results);
          fs.unlinkSync(req.file.path); // Delete the uploaded file after processing
          console.log('Data saved to database and file deleted.');
          res.json({ message: 'File uploaded and data saved successfully' });
          setImmediate(initializeHealthPredictions);
        } catch (err) {
          console.error('Database Error:', err); // Log full database error object
          res.status(500).json({ error: `Failed to save data to database: ${err.message}` });
        }
      })
      .on('error', (err) => {
        console.error('CSV Parsing Error:', err.message); // Log CSV parsing error
        res.status(500).json({ error: 'Failed to parse CSV file' });
      });
  } catch (err) {
    console.error('Upload Error:', err.message); // Log upload error
    res.status(500).json({ error: 'Failed to process file upload' });
  }
});

router.post('/video', upload_video.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Video upload failed' });
  }

  // Construct the relative path for accessing the video (frontend can access it)
  const videoPath = `/assets/video/${req.file.filename}`;

  // Respond with the video path
  res.json({ message: 'Video uploaded successfully', videoPath });
});

module.exports = router;

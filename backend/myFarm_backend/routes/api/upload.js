// const multer = require('multer');
// const csvParser = require('csv-parser');
// const fs = require('fs');
// const express = require("express");
// const path = require('path');
// let router = express.Router();

// const ActivityModel = require('../../models/activity_level');
// const SymptomsModel = require('../../models/CowHealth');

// const upload = multer({ dest: 'uploads/' });
// const upload_video = multer({ dest: path.join(__dirname, '../public/videos') });

// router.post("/", upload.single('file'), (req, res) => {
//   try {
//     const { type } = req.body;
//     const model = type === 'activity' ? ActivityModel : SymptomsModel;

//     if (!model) {
//       return res.status(400).json({ error: 'Invalid type specified' });
//     }

//     const results = [];
//     fs.createReadStream(req.file.path)
//       .pipe(csvParser())
//       .on('data', (data) => results.push(data))
//       .on('end', async () => {
//         try {
//           await model.insertMany(results);
//           fs.unlinkSync(req.file.path); // Delete the uploaded file
//           res.json({ message: 'File uploaded and data saved successfully' });
//         } catch (err) {
//           console.error('Database Error:', err.message); // Log database error
//           res.status(500).json({ error: 'Failed to save data to database' });
//         }
//       })
//       .on('error', (err) => {
//         console.error('CSV Parsing Error:', err.message); // Log CSV parsing error
//         res.status(500).json({ error: 'Failed to parse CSV file' });
//       });
//   } catch (err) {
//     console.error('Upload Error:', err.message); // Log upload error
//     res.status(500).json({ error: 'Failed to process file upload' });
//   }
// });

// router.post('/video', upload.single('video'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: 'Video upload failed' });
//   }

//   // Path where the video is stored after upload
//   const videoPath = req.file.path;

//   // Respond with a success message and path to the uploaded video
//   res.json({ message: 'Video uploaded successfully', videoPath });
// });
// module.exports = router;

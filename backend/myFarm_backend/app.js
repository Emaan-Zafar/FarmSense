var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/api/users');
var catalogRouter = require('./routes/api/catalog');
var activityRouter = require('./routes/api/activity_level');
var healthRouter = require('./routes/api/cow_health');
var AIRouter = require('./routes/api/ai_Suggest');
var graphRouter = require('./routes/api/dashboard_graphs')
// var symptomRouter = require('./routes/api/symptom')
var fileRouter = require('./routes/api/upload');
var diseaseRouter = require('./routes/api/CowDiseaseRoutes');
var videoRouter = require('./routes/api/video-upload')

const videoUploadPath = path.join('C:\Users\Sheikh.Qasim\Documents\Cow_videos');
var app = express();
app.use(cors());
// const path = require('path');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));
app.use('/uploaded-videos', express.static(videoUploadPath));
//app.use('/uploads/videos', express.static(path.join(__dirname, 'uploads/videos')));


// app.use(express.static(path.join(__dirname, 'public')));
// app.use('/assets', express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/catalog', catalogRouter);
app.use('/api/activity', activityRouter);
app.use('/api/health', healthRouter);
app.use('/api/graphs', graphRouter);
// app.use('/api/disease', symptomRouter);
app.use('/api/upload', fileRouter);
app.use('/disease', diseaseRouter);
app.use('/api/ai_Suggest', AIRouter);
app.use('/api/video-upload',videoRouter);

mongoose.connect("mongodb+srv://aamnashahid14:casperHP14@cluster0.oe7dp.mongodb.net/FarmSense?retryWrites=true&w=majority")
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error('MongoDB connection error:', err));


module.exports = app;

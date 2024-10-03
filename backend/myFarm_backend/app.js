var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/api/users');
var catalogRouter = require('./routes/api/catalog');
var diseaseRouter = require('./routes/CowDiseaseRoutes');


var app = express();
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/catalog', catalogRouter);
app.use('/disease', diseaseRouter);

mongoose.connect("mongodb+srv://aamnashahid14:casperHP14@cluster0.oe7dp.mongodb.net/FarmSense?retryWrites=true&w=majority")
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error('MongoDB connection error:', err));


module.exports = app;

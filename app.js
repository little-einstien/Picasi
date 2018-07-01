var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var projects = require('./routes/projects');
var intents = require('./routes/intents');
var users = require('./routes/users');
var flows = require('./routes/flows');
var slots = require('./routes/slots');
var forms = require('./routes/forms');
var weather = require('./routes/weather');
var appointments = require('./routes/appointments')
var cors = require('cors');
var mongo = require('./app/mongo');
var config = require('./config/config');
var app = express();
var randomstring = require("randomstring");
var config = require('./config/config')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cors());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api/users', users);
app.use('/api/slots', slots);
app.use('/api/projects', projects);
app.use('/api/intents', intents);
app.use('/api/flows', flows);
app.use('/api/appointments', appointments);
app.use('/api/weather',weather);
app.use('/api/forms', forms);
 



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Connect to Mongo on start
mongo.connect(config.mongo.url, function (err) {
  if (err) {
    console.log('Unable to connect to Mongo.')
    process.exit(1)
  } else {
    console.log('Mongo Connected !')
  }
})
module.exports = app;

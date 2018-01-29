var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
var cors = require('cors')

var configDB = require('./config/database')
var user = require('./routes/user')
var auth = require('./routes/auth')
var upload = require('./routes/upload')
var file = require('./routes/file')
var movie = require('./routes/movie')

//Debugging purpose
// mongoose.set('debug', true);

mongoose.Promise = global.Promise
mongoose.connect(configDB.uri, {useMongoClient: true})

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors())

app.use('/api', auth, user, file, movie)
app.use('/api/upload', upload)
app.get('/', (req, res) => {
  res.send('API is on /api path.')
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err.message || 'Unknown error');
});

module.exports = app;

var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// var index = require('./routes/index');
// var admin = require('./admin/index')(app);

// var users = require('./routes/users');
// var store = require('./routes/store');

var app = express();

// view engine setup
app.set('views', [__dirname + '/views', __dirname + '/admin/views']);
app.set('view engine', 'ejs');
app.set('view engine', 'pug');
// port setup
app.set('port', process.env.PORT || 9001);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', index);
// app.use('/admin', admin); // Administrator Page

// app.use('/users', users);
// app.use('/store', store);

app.use('/', function(req, res, next){
  res.render('./test.pug');
});

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
  res.render('error');
});

//////////////////////////////////////////////////////
// ------- creates Server -------
module.exports = app;

var server = app.listen(app.get('port'), function() {
console.log('Express server listening on port ' + server.address().port);
});

module.exports = app;

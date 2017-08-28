var express = require('express');
var app = express();

var favicon = require('serve-favicon');
var moment = require('moment');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('./config/mysql/passport')();
var conn = require('./config/mysql/db')();

var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

var methodOverride = require('method-override');
app.use(methodOverride('_method'));
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'staywithme',
  resave: false,
  saveUninitialized: true,
  store:new MySQLStore({
    host:'kusulang.clqnfykyz4cm.ap-northeast-2.rds.amazonaws.com',
    user:'ziumofficial',
    password:'zntbffod1!',
    database:'dbziumofficial'
  })
}));

var articles = require('./routes/articles_index')(app, conn);
var deliveries = require('./routes/deliveries_index')(app, conn);
var banners = require('./routes/banners_index')(app, conn);
var statics = require('./routes/statics_index')(app, conn);
var router = express.Router();

// view engine setup
var pug = require('pug');
app.set('views', [__dirname + '/views']);
app.set('view engine', 'pug');

// port setup
app.set('port', process.env.PORT || 9001);

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/deliveries', deliveries);
app.use('/articles', articles);
app.use('/banners', banners);
app.use('/statics', statics);

app.route('/')
      .get(function (req, res, next) { // index page
        res.render('admin.pug', {status: req.session.status});
      })
      .post(function (req, res, next) { // POST Login

        var admin_info = {
          id: 'admin',
          password: 'socrates',
          status: 'admin'
        };

        var id = req.body.id;
        var password = req.body.password;

        if(id === admin_info.id && password === admin_info.password) {
          req.session.status = admin_info.status;
          res.render('admin.pug', {status: admin_info.status});
        } else {
          res.render('admin.pug', {status: 'failed'});
        }

      });

app.route('/logout')
    .get(function(req, res, next){
      if(req.session.status !== undefined){
        req.session.status = undefined;
        res.redirect('/');
      } else {
        res.redirect('/');
      }
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
  res.send('error '+err);
});

//////////////////////////////////////////////////////
// ------- creates Server -------
module.exports = app;

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

var background = require('./background/scheduler')(app, conn);


module.exports = app;

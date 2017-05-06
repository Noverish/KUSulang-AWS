module.exports = function() {
  var express = require('express');
  var app = express();
  // var router = express.Router();
  var session = require('express-session');
  var MySQLStore = require('express-mysql-session')(session);
  var bodyParser = require('body-parser');

  var pug = require('pug');
  app.set('views', '/admin/views');
  app.set('view engine', 'pug');

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
      host:'db.ziumcompany.net',
      user:'ziumofficial',
      password:'zntbffod1!',
      database:'dbziumofficial'
    })
  }));
  return app;
};

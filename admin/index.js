/*
Administrator Index
*/
module.exports = function(app) {
  var express = require('express');
  var router = express.Router();

  var admin_app = require('./config/mysql/express');
  var passport = require('./config/mysql/passport')();
  var conn = require('./config/mysql/db')();

  var article = require('./routes/article/index')(admin_app, conn);
  router.use('/article', article);

  router.get('/', function (req, res, next) { // index page
    res.render('admin.pug');
  });

  return router;
};

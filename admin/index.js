/*
Administrator Index
*/
module.exports = function() {
  var express = require('express');
  var router = express.Router();
  // router = require('./config/router_setting')(router);

  var admin_app = require('./config/express');
  var passport = require('./config/mysql/passport')();
  var conn = require('./config/mysql/db')();

  var articles = require('./routes/articles_index')(admin_app, conn);
  var deliveries = require('./routes/deliveries_index')(admin_app, conn);

  var session = require('express-session');
  router.use(session({
    secret: 'staywithme',
    resave: false,
    saveUninitialized: true
    // , store:new MySQLStore({
    //   host:'db.ziumcompany.net',
    //   user:'ziumofficial',
    //   password:'zntbffod1!',
    //   database:'dbziumofficial'
    // })
  }));

  router.use('/deliveries', deliveries);
  router.use('/articles', articles);

  router.route('/')
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

  return router;
};

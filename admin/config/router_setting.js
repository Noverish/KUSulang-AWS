module.exports = function(router) {
  var express = require('express');
  var router = express.Router();
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

  var methodOverride = require('method-override');
  router.use(methodOverride('_method'));
  router.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      var method = req.body._method
      delete req.body._method
      return method
    }
  }));

  router.all('*', function(req, res, next){
    // console.log(router);
    if(req.session.status !== 'admin' ||
        req.session.status === undefined) {
      res.redirect('/');
    } else {
      next();
    }
  });

  return router;
}

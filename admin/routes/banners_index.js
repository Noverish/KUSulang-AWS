/*
Banners

GET - '/home'
      '/search'
      '/article'
      '/announce'

GET - '/home/:id'
      '/search/:id'
      '/article/:id'
      '/announce/:id'

POST -  '/home'
        '/search'
        '/article'
        '/announce'

*/

module.exports = function(app, conn) {
  var express = require('express');
  var router = express.Router();
  router = require('../config/router_setting')(router);

  var controllers = require('../controllers/banners_controllers');

  router.get('/', function(req, res, next) {
    res.send('hello');
  })

  router.route('/:select')
        .get(controllers.banners_list)
        .post();

  router.route('/:select/:id')
        .get()
        .post();


  // router.route('/home')
  //       .get()
  //       .post();
  //
  // router.route('/search')
  //       .get()
  //       .post();
  //
  // router.route('/article')
  //       .get()
  //       .post();
  //
  // router.route('/announce')
  //       .get()
  //       .post();
  //
  // router.route('/home/:id')
  //       .get()
  //       .post();
  //
  // router.route('/search/:id')
  //       .get()
  //       .post();
  //
  // router.route('/article/:id')
  //       .get()
  //       .post();
  //
  // router.route('/announce/:id')
  //       .get()
  //       .post();

  return router;
}

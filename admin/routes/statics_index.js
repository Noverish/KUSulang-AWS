module.exports = function(app, conn) {
  var express = require('express');
  var router = express.Router();
  router = require('../config/router_setting')(router);

  var controllers = require('../controllers/statics_controllers');

  router.route('/').get(controllers.home);
  router.route('/users').get(controllers.count_user);
  router.route('/reviews').get(controllers.count_review);
  router.route('/articles').get(controllers.count_article);
  router.route('/banners').get(controllers.count_banner);
  router.route('/login').get(controllers.count_login);

  return router;
}

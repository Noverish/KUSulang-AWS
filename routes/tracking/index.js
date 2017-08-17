module.exports = function(tracking_controllers) {
  var express = require('express');
  var router = express.Router();

  router.post('/menu-tag', tracking_controllers.history_menu_tag);
  router.post('/banner/home', tracking_controllers.history_banner_home);
  router.post('/banner/article', tracking_controllers.history_banner_article);
  router.post('/banner/search', tracking_controllers.history_banner_search);

  return router;
}

/*
Deliveries

GET : '/' List Deliveries
GET : '/:ID' Select ID Delivery View
POST : '/' Write Delivery

*/
module.exports = function(app, conn) {
  var express = require('express');
  var router = express.Router();
  router = require('../config/router_setting')(router);

  // var sql_FROM_Article = 'ArticleTest';
  // var sql_INSERT_defaultUrl = 'https://s3.ap-northeast-2.amazonaws.com/kusulang-test/';
  // var s3_bucket = 'kusulang-test';

  var controllers = require('../controllers/deliveries_controllers');

  router.route('/')
        .get(controllers.today_list); // Deliveries

  router.get('/all', controllers.all_list); // Delivety All list

  router.get('/test', controllers.test);

  // router.get('/setting', controllers.delivery_setting);
  // router.post('/setting/time', controllers.delivery_time_modify);
  // router.post('/setting/deliverable', controllers.delivery_deliverable);

  router.route('/:id')
        .post(controllers.status_modify) // Delivery Status Modify
        .get(controllers.view); // Delivery Detail View

  router.post('/:id/cancel', controllers.status_cancel); // Delivery Cancel
  router.post('/:id/deliverer', controllers.deliverer_select); // Deliverer Select page


  return router;
}

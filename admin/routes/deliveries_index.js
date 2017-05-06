/*
Deliveries

GET : '/' List Deliveries
GET : '/:ID' Select ID Delivery View
POST : '/' Write Delivery
PUT : '/:ID' Update Delivery
DELETE : '/:ID' Delete Delivery

*/
module.exports = function(app, conn) {
  var express = require('express');
  var router = express.Router();
  router = require('../config/router_setting')(router);

  var sql_FROM_Article = 'ArticleTest';
  var sql_INSERT_defaultUrl = 'https://s3.ap-northeast-2.amazonaws.com/kusulang-test/';
  var s3_bucket = 'kusulang-test';

  var controllers = require('../controllers/deliveries_controllers');

  router.route('/')
        .get(controllers.list); // Deliveries list

  router.route('/:id')
        .get(controllers.view);

  // Delivery View
  // router.get('/:id', function (req, res, next) {
  //   var id = req.params.id;
  //   res.render('deliveries/view.pug', {id: id});
  // });

  return router;
}

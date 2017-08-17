module.exports = function(app) {
  var express = require('express');
  var router = express.Router();

  app.set('view engine', 'pug');

  var api_controllers = require('../controllers/api_controllers');

  var tracking_controllers = require('../controllers/tracking_controllers');

  var api_version_v1 = require('../routes/v1/index')(api_controllers, '1');
  var api_version_v2 = require('../routes/v2/index')(api_controllers, '2');
  var api_version_v3 = require('../routes/v3/index')(api_controllers, '3');

  var tracking = require('../routes/tracking/index')(tracking_controllers);

  app.use('/kusulang/v1', api_version_v1);
  app.use('/kusulang/v2', api_version_v2);
  app.use('/kusulang/v3', api_version_v3);

  app.use('/kusulang/*/tracking', tracking);

  // app.use('/', api_version_v2);

  return router;
}

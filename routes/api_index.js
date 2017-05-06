module.exports = function(app) {
  var express = require('express');
  var router = express.Router();

  app.set('view engine', 'pug');

  var api_controllers = require('../controllers/api_controllers');

  var api_version_v1 = require('../routes/v1/index')(api_controllers, '1');
  var api_version_v2 = require('../routes/v2/index')(api_controllers, '2');
  var api_version_v3 = require('../routes/v3/index')(api_controllers, '3');

  app.use('/v1', api_version_v1);
  app.use('/v2', api_version_v2);
  app.use('/v3', api_version_v3);

  // app.use('/', api_version_v2);

  return router;
}

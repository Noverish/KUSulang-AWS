module.exports = function(api_controllers, version) {
  var express = require('express');
  var router = express.Router();

  var setting = api_controllers.version_setting('v'+version);

  return setting.router(router, api_controllers, version);
}

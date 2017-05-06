exports.version_controllers = function(version) {
  var controllers = require('./'+version+'/controllers');
  return controllers;
};

exports.version_setting = function(version) {
  var setting = require('./'+version+'/setting');
  return setting;
};

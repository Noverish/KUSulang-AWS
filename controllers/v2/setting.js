exports.router = function(_router, api_controllers, version) {
  var router = _router;
  var controllers = api_controllers.version_controllers('v'+version);

  version = version - 1;
  var prev_setting = api_controllers.version_setting('v'+version);

  router.get('/', function(req, res, next) {
    res.send('API v2');
  });

  router.route('/article')
        .get(controllers.article);

  router = prev_setting.router(router, api_controllers, version);

  return router;
}

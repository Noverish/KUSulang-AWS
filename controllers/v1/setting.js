var express = require('express');
var app = express();
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });

var bodyParser = require('body-parser');

exports.router = function(_router, api_controllers, version) {
  var router = _router;
  router.use(bodyParser.urlencoded({ extended: false }));
  var controllers = api_controllers.version_controllers('v'+version);

  router.get('/', function(req, res, next) {
    res.send('API v1');
  });

  // router.get('/stores/:id/images/upload', function(req, res, next) {
  //   var id = req.params.id;
  //   res.render('store_image_upload.pug', {id, id});
  // });

  router.get('/announces', controllers.announce_list);

  router.get('/banners/home', controllers.banner_home);
  router.get('/banners/article', controllers.banner_article);
  router.get('/banners/search', controllers.banner_search);

  router.route('/deliveries')
        .get(controllers.delivery_list)
        .post(controllers.delivery_request);

  router.put('/deliveries/:id', controllers.delivery_modify);

  router.get('/deliveries/deliverable-stores', controllers.delivery_deliverable_store);

  router.get('/writers', controllers.writer_list);
  router.get('/writers/:id', controllers.writer_info);
  router.get('/writers/:id/articles', controllers.writer_article_list);

  router.route('/writers/:writer_id/articles/:article_id/comments')
        .post(controllers.article_comment_write)
        .get(controllers.article_comment_list);

  router.route('/writers/:writer_id/articles/:article_id/comments/:comment_id')
        .get(controllers.article_comment_info)
        .put(controllers.article_comment_modify)
        .delete(controllers.article_comment_delete);

  var store_image_upload = require(process.cwd()+'/routes/store');
  router.use('/store_old', store_image_upload);

  return router;
}

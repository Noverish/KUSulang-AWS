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

  router.get('/api_table', function(req, res, next) {
    var table = {

      php_base: 'ziumcompany.net/api/',
      node_base: 'api.ziumcompany.net/kusulang/v1/',

      data: {
        announce_list: {
          node_uri: '/announces'
          , php_uri: ''
          , request_method: 'GET'
        }
        , banner_home: {
          node_uri: '/banners/home'
          , php_uri: ''
          , request_method: 'GET'
        }
        , banner_article: {
          node_uri: '/banners/article'
          , php_uri: ''
          , request_method: 'GET'
        }
        , banner_search: {
          node_uri: '/banners/search'
          , php_uri: ''
          , request_method: 'GET'
        }
        , delivery_list: {
          node_uri: '/deliveries'
          , php_uri: ''
          , request_method: 'GET'
        }
        , delivery_request: {
          node_uri: '/deliveries'
          , php_uri: ''
          , request_method: 'POST'
        }
        , delivery_modify: {
          node_uri: '/deliveries/:id'
          , php_uri: ''
          , request_method: 'PUT'
        }
        , delivery_deliverable_store: {
          node_uri: '/deliveries/deliverable-stores'
          , php_uri: ''
          , request_method: 'GET'
        }
        , delivery_deliverable_address: {
          node_uri: '/deliveries/deliverable-address'
          , php_uri: ''
          , request_method: 'GET'
        }
        , store_menu_tag_list: {
          node_uri: '/stores/menu-tags'
          , php_uri: ''
          , request_method: 'GET'
        }
        , store_search_keyword_name: {
          node_uri: '/stores/search/keyword/name'
          , php_uri: ''
          , request_method: 'GET'
        }
        , store_search_keyword_popular: {
          node_uri: '/stores/search/keyword/popular'
          , php_uri: ''
          , request_method: 'GET'
        }
        , store_search_keyword_random: {
          node_uri: '/stores/search/keyword/random'
          , php_uri: ''
          , request_method: 'GET'
        }
        , store_review_image_upload: {
          node_uri: '/stores/:store_id/reviews/images'
          , php_uri: ''
          , request_method: 'POST'
        }
        , writer_list: {
          node_uri: '/writers'
          , php_uri: ''
          , request_method: 'GET'
        }
        , writer_info: {
          node_uri: '/writers/:id'
          , php_uri: ''
          , request_method: 'GET'
        }
        , writer_article_list: {
          node_uri: '/writers/:id/articles'
          , php_uri: ''
          , request_method: 'GET'
        }
        , article_comment_write: {
          node_uri: '/writers/:writer_id/articles/:article_id/comments'
          , php_uri: ''
          , request_method: 'POST'
        }
        , article_comment_list: {
          node_uri: '/writers/:writer_id/articles/:article_id/comments'
          , php_uri: ''
          , request_method: 'GET'
        }
        , article_comment_info: {
          node_uri: '/writers/:writer_id/articles/:article_id/comments/:comment_id'
          , php_uri: ''
          , request_method: 'GET'
        }
        , article_comment_modify: {
          node_uri: '/writers/:writer_id/articles/:article_id/comments/:comment_id'
          , php_uri: ''
          , request_method: 'PUT'
        }
        , article_comment_delete: {
          node_uri: '/writers/:writer_id/articles/:article_id/comments/:comment_id'
          , php_uri: ''
          , request_method: 'DELETE'
        }
        , user_name_random: {
          node_uri: ''
          , php_uri: 'user_name_random.php'
          , request_method: ''
        }
        , user_name_check: {
          node_uri: ''
          , php_uri: 'user_name_check.php'
          , request_method: ''
        }
        , user_register: {
          node_uri: ''
          , php_uri: 'user_register.php'
          , request_method: ''
        }
        , user_login: {
          node_uri: ''
          , php_uri: 'user_login.php'
          , request_method: ''
        }
        , login_img: {
          node_uri: ''
          , php_uri: 'login_img.php'
          , request_method: ''
        }
        , search_option: {
          node_uri: ''
          , php_uri: 'search_option.php'
          , request_method: ''
        }
        , search_random: {
          node_uri: ''
          , php_uri: 'search_random.php'
          , request_method: ''
        }
        , search_keyword: {
          node_uri: ''
          , php_uri: 'search_keyword.php'
          , request_method: ''
        }
        , rcmd_list: {
          node_uri: ''
          , php_uri: 'rcmd_list.php'
          , request_method: ''
        }
        , rcmd_card_news: {
          node_uri: ''
          , php_uri: 'rcmd_card_news.php'
          , request_method: ''
        }
        , truck_list: {
          node_uri: ''
          , php_uri: 'truck_list.php'
          , request_method: ''
        }
        , truck_report: {
          node_uri: ''
          , php_uri: 'truck_report.php'
          , request_method: ''
        }
        , event_list: {
          node_uri: ''
          , php_uri: 'event_list.php'
          , request_method: ''
        }
        , review_list: {
          node_uri: ''
          , php_uri: 'review_list.php'
          , request_method: ''
        }
        , user_rank: {
          node_uri: ''
          , php_uri: 'user_rank.php'
          , request_method: ''
        }
        , user_info: {
          node_uri: ''
          , php_uri: 'user_info.php'
          , request_method: ''
        }
        , user_review: {
          node_uri: ''
          , php_uri: 'user_review.php'
          , request_method: ''
        }
        , user_dibs: {
          node_uri: ''
          , php_uri: 'user_dibs.php'
          , request_method: ''
        }
        , user_like: {
          node_uri: ''
          , php_uri: 'user_like.php'
          , request_method: ''
        }
        , use_msg_write: {
          node_uri: ''
          , php_uri: 'use_msg_write.php'
          , request_method: ''
        }
        , user_msg_list: {
          node_uri: ''
          , php_uri: 'user_msg_list.php'
          , request_method: ''
        }
        , store_info: {
          node_uri: ''
          , php_uri: 'store_info.php'
          , request_method: ''
        }
        , store_preview: {
          node_uri: ''
          , php_uri: 'store_preview.php'
          , request_method: ''
        }
        , store_dib: {
          node_uri: ''
          , php_uri: 'store_dib.php'
          , request_method: ''
        }
        , store_report: {
          node_uri: ''
          , php_uri: 'store_report.php'
          , request_method: ''
        }
        , store_review: {
          node_uri: ''
          , php_uri: 'store_review.php'
          , request_method: ''
        }
        , review_info: {
          node_uri: ''
          , php_uri: 'review_info.php'
          , request_method: ''
        }
        , review_is_like: {
          node_uri: ''
          , php_uri: 'review_is_like.php'
          , request_method: ''
        }
        , review_write: {
          node_uri: ''
          , php_uri: 'review_write.php'
          , request_method: ''
        }
        , review_modify: {
          node_uri: ''
          , php_uri: 'review_modify.php'
          , request_method: ''
        }
        , review_delete: {
          node_uri: ''
          , php_uri: 'review_delete.php'
          , request_method: ''
        }
        , review_like: {
          node_uri: ''
          , php_uri: 'review_like.php'
          , request_method: ''
        }
        , review_comment_list: {
          node_uri: ''
          , php_uri: 'review_comment_list.php'
          , request_method: ''
        }
        , review_comment_info: {
          node_uri: ''
          , php_uri: 'review_comment_info.php'
          , request_method: ''
        }
        , review_comment_write: {
          node_uri: ''
          , php_uri: 'review_comment_write.php'
          , request_method: ''
        }
        , review_comment_delete: {
          node_uri: ''
          , php_uri: 'review_comment_delete.php'
          , request_method: ''
        }
        , article_list: {
          node_uri: ''
          , php_uri: 'article_list.php'
          , request_method: ''
        }
        , article_like: {
          node_uri: ''
          , php_uri: 'article_like.php'
          , request_method: ''
        }
        , article_info: {
          node_uri: ''
          , php_uri: 'article_info.php'
          , request_method: ''
        }
        , cafeteria: {
          node_uri: ''
          , php_uri: 'cafeteria.php'
          , request_method: ''
        }
      //article_list, article_info node랑 php랑 이름 겹침
      }

    }
    res.send(table);
  });

  router.get('/announces', controllers.announce_list);

  router.get('/banners/home', controllers.banner_home);
  router.get('/banners/article', controllers.banner_article);
  router.get('/banners/search', controllers.banner_search);

  router.get('/deliveries/deliverable-stores', controllers.delivery_deliverable_store);
  router.get('/deliveries/deliverable-address', controllers.delivery_deliverable_address);
  router.get('/deliveries/deliverable-time', controllers.delivery_deliverable_time);

  router.route('/deliveries')
        .get(controllers.delivery_list)
        .post(controllers.delivery_request);
  router.route('/deliveries/:id')
        .get(controllers.delivery_info)
        .put(controllers.delivery_modify);

  router.get('/stores/menu-tags', controllers.store_menu_tag_list);
  router.get('/stores/search/keyword/name', controllers.store_search_keyword_name);
  router.get('/stores/search/keyword/popular', controllers.store_search_keyword_popular);
  router.get('/stores/search/keyword/random', controllers.store_search_keyword_random);

  router.post('/stores/:store_id/reviews/images', controllers.store_review_image_upload);

  router.get('/writers', controllers.writer_list);
  router.get('/writers/articles', controllers.article_list);
  router.get('/writers/:id', controllers.writer_info);
  router.get('/writers/:id/articles', controllers.writer_article_list);
  router.get('/writers/:writer_id/articles/:article_id', controllers.article_info);
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

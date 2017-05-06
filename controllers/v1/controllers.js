var express = require('express');
var app = express();
var request = require('request');
var fs = require('fs');
var conn = require('../../config/mysql/db.js')();
var sql_FROM_ArticleWriter = 'ArticleWriter ';
var sql_FROM_Article = 'Article ';
var sql_FROM_Announce = 'Announce ';

var page_size = '20';

exports.store_old = function(req, res, next) {
  var id = req.params.id;
  var image = req.file;

  fs.rename(image.destination + image.filename, image.destination + image.originalname, function(){
    var upload_request = request.post({
      headers: {'content-type' : 'multipart/form-data'},
      url:     'http://localhost:9000/store/'+id
      }, function(error, response, body){
      console.log(error);
      var json = JSON.parse(body);
      fs.unlink(image.destination + image.originalname);
      res.status(200).json(json);
    });

    var form = upload_request.form();
    form.append('image', fs.createReadStream(image.destination + image.originalname));
  });

};

exports.announce_list = function(req, res, next) {
  var page = req.query.page;
  var page_offset = page_size * (page - 1);

  var sql =
  'SELECT _id AS announce_id, img, url, date '
  + 'FROM ' + sql_FROM_Announce
  + 'ORDER BY _id DESC '
  + 'LIMIT ?, ?'

  conn.query(sql, [parseInt(page_offset), parseInt(page_size)], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('writer_list select err : '+err);
      json = results_json(json, '0', err);
      json['data'] = results;
      res.status(200).json(json);
    }

    json = results_json(json, '1');
    json['data'] = results;
    res.status(200).json(json);
  });

}

// not complete
exports.article_comment_info = function(req, res, next) {

}

// not complete
exports.article_comment_modify = function(req, res, next) {

}

// not complete
exports.article_comment_delete = function(req, res, next) {

}

// not complete
exports.article_comment_list = function(req, res, next) {
  var page = req.query.page;
  var page_offset = page_size * (page - 1);
  var writer_id = req.parmas.writer_id;
  var article_id = req.params.article_id;

}

// not complete
exports.article_comment_write = function(req, res, next) {

}

// not complete
exports.banner_home = function(req, res, next) {

}

// not complete
exports.banner_article = function(req, res, next) {

}

// not complete
exports.banner_search = function(req, res, next) {

}

// not complete
exports.delivery_list = function(req, res, next) {

}

// not complete
exports.delivery_request = function(req, res, next) {

}

// not complete
exports.delivery_deliverable_store = function(req, res, next) {

}

// not complete
exports.delivery_modify = function(req, res, next) {

}

exports.writer_article_list = function(req, res, next) {
  var page = req.query.page;
  var page_offset = page_size * (page - 1);
  var id = req.params.id;
  var sql =
  'SELECT ar._id, ar.img, ar.title, count(al._id) as like_total, count(ac._id) as comment_total, ar.date '
  + 'FROM ' + sql_FROM_Article + 'AS ar '
  + 'LEFT OUTER JOIN ArticleLike AS al ON ar._id = al.article_id '
  + 'LEFT OUTER JOIN ArticleComment AS ac ON ar._id = ac.article_id '
  + 'WHERE ar.writer_id = ?'
  + 'GROUP BY ar._id '
  + 'HAVING count(ar._id) '
  + 'ORDER BY ar._id DESC '
  + 'LIMIT ?, ?'

  conn.query(sql, [id, parseInt(page_offset), parseInt(page_size)], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('writer_list select err : '+err);
      json = results_json(json, '0', err);
      json['data'] = results;
      res.status(200).json(json);
    }
    console.log(results);
    json['data'] = results;
    json = results_json(json, '1');
    res.status(200).json(json);
  });
}

exports.writer_info = function(req, res, next) {
  var id = req.params.id;
  var sql =
  'SELECT profile_main, profile_img, name, detail, like_total '
  + 'FROM ' + sql_FROM_ArticleWriter + 'AS aw '
  + 'JOIN (SELECT ar.writer_id, count(*) as like_total '
  	     + 'FROM Article AS ar '
  	     + 'JOIN ArticleLike AS al ON ar._id = al.article_id '
  	     + 'GROUP BY ar.writer_id '
  	     + 'HAVING count(writer_id)) AS at '
  + 'ON at.writer_id = aw._id '
  + 'WHERE aw._id = ?';

  conn.query(sql, [id], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('writer_list select err : '+err);
      json = results_json(json, '0', err);
      json['data'] = results;
      res.status(200).json(json);
    }
    json = results[0];
    json = results_json(json, '1');
    res.status(200).json(json);
  });
}

exports.writer_list = function(req, res, next) {
  var page = req.query.page;
  var page_offset = page_size * (page - 1);

  var sql =
  'SELECT _id AS writer_id, profile_main, profile_img, name, detail, like_total '
  + 'FROM ' + sql_FROM_ArticleWriter + 'AS aw '
  + 'JOIN (SELECT ar.writer_id, count(*) as like_total '
  	     + 'FROM Article AS ar '
  	     + 'JOIN ArticleLike AS al ON ar._id = al.article_id '
  	     + 'GROUP BY ar.writer_id '
  	     + 'HAVING count(writer_id)) AS at '
  + 'ON at.writer_id = aw._id '
  + 'ORDER BY _id DESC '
  + 'LIMIT ?, ?'

  conn.query(sql, [parseInt(page_offset), parseInt(page_size)], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('writer_list select err : '+err);
      json = results_json(json, '0', err);
      json['data'] = results;
      res.status(200).json(json);
    }

    json = results_json(json, '1');
    json['data'] = results;
    res.status(200).json(json);
  });

};

function results_json(json, successful, err) {
  if(successful === '0') { // fail
    json['res'] = '0';
    json['msg'] = err;
    return json;
  } else if (successful === '1') { // success
    json['res'] = '1';
    return json;
  }
}

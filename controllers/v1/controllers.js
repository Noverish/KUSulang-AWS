var express = require('express');
var app = express();
var request = require('request');
var fs = require('fs');
var conn = require('../../config/mysql/db.js')();

var sql_FROM_ArticleWriter = 'ArticleWriter ';
var sql_FROM_Article = 'Article ';
var sql_FROM_ArticleComment = 'ArticleComment ';
var sql_FROM_Announce = 'Announce ';
var sql_FROM_BannerHome = 'BannerHome ';
var sql_FROM_BannerSearch = 'BannerSearch ';
var sql_FROM_BannerArticle = 'BannerArticle ';
var sql_FROM_User = 'User ';
var sql_FROM_Delivery = 'Delivery ';

var base_s3_url = 'https://s3.ap-northeast-2.amazonaws.com/kusulang-test/';

var page_size = '20';

conn.on('error', function(err) {
  if(err) {
    var json = {}
    var msg;
    for (var val in err) {
      if (object.hasOwnProperty(val)) {
        msg = msg + exception(val) + '\n';
      }
    }
    json['res'] = '0';
    json['msg'] = msg;
    res.status(200).json(json);
  }
});

/**
todo : img url paste, use model
**/

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
    'SELECT _id AS announce_id, CONCAT(? ,img) AS img, url, date '
    + 'FROM ' + sql_FROM_Announce
    + 'ORDER BY _id DESC '
    + 'LIMIT ?, ?'

    conn.query(sql, [base_s3_url, parseInt(page_offset), parseInt(page_size)], function(err, results, fields) {
      var json = {};
      if(err) {
        console.log('announce_list select err : '+err);
        json = results_json(json, '0', err);
        res.status(200).json(json);
      } else {
        json = results_json(json, '1');
        json['data'] = results;
        res.status(200).json(json);
      }
    });
}

// Not Include compare writer_id
exports.article_comment_info = function(req, res, next) {

  var writer_id = req.params.writer_id;
  var article_id = req.params.article_id;
  var comment_id = req.params.comment_id;

  var sql =
  'SELECT ac._id AS comment_id, ac.user_id, us.user_name, us.is_owner, ac.content, ac.date '
  + 'FROM '+sql_FROM_ArticleComment+' AS ac '
  + 'JOIN User AS us ON ac.user_id = us._id '
  + 'WHERE ac.article_id = ? && ac._id = ? '

  conn.query(sql, [article_id, comment_id], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('article_comment_info select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      json = results[0];
      json = results_json(json, '1');
      res.status(200).json(json);
    }
  });
}

// not complete todo:작성자, 아티클, 유저 확인
exports.article_comment_modify = function(req, res, next) {

  var comment_id = req.params.comment_id;
  var writer_id = req.params.writer_id;
  var article_id = req.params.article_id;
  var user_token = req.body.user_token;
  var _content = req.body.content;

  var sql =
  'UPDATE ' + sql_FROM_ArticleComment
  + 'SET ? '
  + 'WHERE _id = ? and article_id = ? and user_id = ?'

  conn.query(sql, [{content: _content}, comment_id, article_id, user_token], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('article_comment_modify update err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      json = results_json(json, '1');
      console.log(results);
      // json['comment_id'] = results.insertId;
      res.status(200).json(json);
    }
  });

}

// not complete todo:작성자, 아티클, 유저 확인
exports.article_comment_delete = function(req, res, next) {

  var comment_id = req.params.comment_id;
  var writer_id = req.params.writer_id;
  var article_id = req.params.article_id;
  var user_token = req.body.user_token;

  var sql =
  'DELETE FROM ' + sql_FROM_ArticleComment
  + 'WHERE _id = ? and article_id = ? and user_id = ?'

  conn.query(sql, [comment_id, article_id, user_token], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('article_comment_delete update err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      json = results_json(json, '1');
      console.log(results);
      // json['comment_id'] = results.insertId;
      res.status(200).json(json);
    }
  });

}

// Not Include compare writer_id
exports.article_comment_list = function(req, res, next) {
  var page = req.query.page;
  var page_offset = page_size * (page - 1);
  var writer_id = req.params.writer_id;
  var article_id = req.params.article_id;

  var sql =
  'SELECT ac._id AS comment_id, ac.user_id, us.user_name, us.is_owner, ac.content, ac.date '
  + 'FROM '+sql_FROM_ArticleComment+' AS ac '
  + 'JOIN User AS us ON ac.user_id = us._id '
  + 'WHERE ac.article_id = ?'
  + 'ORDER BY date DESC '
  + 'LIMIT ?, ?'

  conn.query(sql, [article_id, parseInt(page_offset), parseInt(page_size)], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('article_comment_list select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      json = results_json(json, '1');
      json['data'] = results;
      res.status(200).json(json);
    }
  });
}

// Not Include compare writer_id
exports.article_comment_write = function(req, res, next) {

  var writer_id = req.params.writer_id;
  var article_id = req.params.article_id;
  var user_token = req.body.user_token;
  var content = req.body.content;
  var currentDate = 'now()';

  var sql =
  'INSERT INTO ' +sql_FROM_ArticleComment+ ' (article_id, user_id, content, date) '
  + 'VALUES (?, ?, ?, ?) '

  conn.query(sql, [article_id, user_token, content, currentDate], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('article_comment_list select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      json = results_json(json, '1');
      json['comment_id'] = results.insertId;
      res.status(200).json(json);
    }
  });

}

exports.banner_home = function(req, res, next) {
  var sql =
  'SELECT _id AS banner_id, CONCAT(? ,img) AS img, behave, data '
  + 'FROM ' + sql_FROM_BannerHome
  conn.query(sql, [base_s3_url], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('banner_home select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      json = results_json(json, '1');
      json['data'] = results;
      res.status(200).json(json);
    }
  });
}

exports.banner_article = function(req, res, next) {
  var sql =
  'SELECT _id AS banner_id, CONCAT(? ,img) AS img, behave, data '
  + 'FROM ' + sql_FROM_BannerArticle
  conn.query(sql, [base_s3_url], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('banner_home select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      json = results_json(json, '1');
      json['data'] = results;
      res.status(200).json(json);
    }
  });
}

exports.banner_search = function(req, res, next) {
  var sql =
  'SELECT _id AS banner_id, CONCAT(? ,img) AS img, behave, data '
  + 'FROM ' + sql_FROM_BannerSearch
  conn.query(sql, [base_s3_url], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('banner_home select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      json = results_json(json, '1');
      json['data'] = results;
      res.status(200).json(json);
    }
  });
}

// not complete 
exports.delivery_list = function(req, res, next) {
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
      res.status(200).json(json);
    } else {
      console.log(results);
      json = results_json(json, '1');
      json['data'] = results;
      res.status(200).json(json);
    }
  });
}

// 변경될 거 같음
exports.delivery_request = function(req, res, next) {

  var id = req.params.id;
  var user_token = req.body.user_token;

  var is_user_place = req.body.is_user_place;
  var user_place = req.body.user_place;
  var place_type = req.body.place_type;
  var place_id = req.body.place_id;
  var menu = req.body.menu;
  var contact = req.body.contact;
  var location = req.body.location;
  var payment = req.body.payment;
  var note = req.body.note;

  var sql =
  'INSERT INTO ' +sql_FROM_Delivery
  + '(user_id, is_user_place, user_place, place_id, menu, contact, location, payment, note) '
  + 'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) '

  conn.query(sql,
    [user_token, is_user_place, user_place, place_id, menu, contact, location, payment, note],
    function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('article_comment_list select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      json = results_json(json, '1');
      json['delivery_id'] = results.insertId;
      res.status(200).json(json);
    }
  });

}

// not complete
exports.delivery_modify = function(req, res, next) {

}

exports.delivery_deliverable_store = function(req, res, next) {
  var sql =
  'SELECT pl.type as place_type, pl._id as place_id, st.name as place_name '
  + 'FROM Place AS pl '
  + 'JOIN ((SELECT _id, name FROM Truck) UNION (SELECT _id, name FROM Store)) AS st '
  + 'ON st._id = pl._id '
  + 'WHERE pl.is_deliverable = 1 '

  conn.query(sql, [], function(err, results, fields) {
    var json = {};
    if(err) {
      console.log('writer_list select err : '+err);
      json = results_json(json, '0', err);
      res.status(200).json(json);
    } else {
      json = results_json(json, '1');
      json['data'] = results;
      res.status(200).json(json);
    }
  });
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
      res.status(200).json(json);
    } else {
      console.log(results);
      json = results_json(json, '1');
      json['data'] = results;
      res.status(200).json(json);
    }
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
      res.status(200).json(json);
    } else {
      json = results[0];
      json = results_json(json, '1');
      res.status(200).json(json);
    }
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
      res.status(200).json(json);
    } else {
      json = results_json(json, '1');
      json['data'] = results;
      res.status(200).json(json);
    }
  });

};

function results_json(json, successful, err) {
  if(successful === '0') { // fail
    var json = {};
    json['res'] = '0';
    json['msg'] = err;
    return json;
  } else if (successful === '1') { // success
    json['res'] = '1';
    return json;
  }
}
